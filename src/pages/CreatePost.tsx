import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronDown, Image as ImageIcon, X, Briefcase, MessageSquare, HelpCircle, Link as LinkIcon } from 'lucide-react';
import { useCreatePostMutation, useCreateOpportunityPostMutation } from '../redux/features/post/postApi';
import { useGetJoinedCommunitiesQuery } from '../redux/features/community/communityApi';
import { useAppSelector } from '../redux/hooks';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ImgBB API endpoint
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be 300 characters or less'),
  body: z.string().optional(),
  org_name: z.string().optional(),
  location: z.string().optional(),
  deadline: z.string().optional(),
  apply_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  opp_category: z.string().optional(),
  skills_req: z.string().optional(),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

const quillModules = {
  toolbar: [
    ['bold', 'italic'],
    [{ background: [] }],
    [{ list: 'bullet' }, { list: 'ordered' }]
  ]
};

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: joinedResponse } = useGetJoinedCommunitiesQuery(undefined, { skip: !user });
  const joinedCommunities = joinedResponse?.data || [];

  React.useEffect(() => {
    if (user?.role === 'admin') {
      toast.error('Admins cannot create posts.');
      navigate('/');
    } else if (user?.is_banned) {
      toast.error('Banned users cannot create posts.');
      navigate('/');
    }
  }, [user, navigate]);

  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  const [createOpportunityPost, { isLoading: isCreatingOpp }] = useCreateOpportunityPostMutation();
  
  const [postType, setPostType] = useState<'discussion' | 'opportunity' | 'news' | 'question' | 'link'>('discussion');

  const isLoading = isCreatingPost || isCreatingOpp;

  const [community, setCommunity] = useState<{ id: number; name: string } | null>(
    location.state?.community ? { id: Number(location.state?.community_id) || 0, name: location.state?.community } : null
  );
  
  // Robustly resolve community ID if it was pre-selected by name but ID is missing
  React.useEffect(() => {
    if (community && community.id === 0 && joinedCommunities.length > 0) {
      const matched = joinedCommunities.find((c: any) => c.name === community.name);
      if (matched && matched.community_id) {
        setCommunity({ id: matched.community_id, name: community.name });
      }
    }
  }, [community, joinedCommunities]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    mode: 'onChange',
  });

  const titleValue = watch('title', '');
  const bodyValue = watch('body', '');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 4) {
        toast.error('You can only upload up to 4 images');
        return;
      }

      const newImages = selectedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const uploadImagesToImgBB = async (): Promise<string[]> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey && images.length > 0) {
      throw new Error('ImgBB API key is missing. Please add VITE_IMGBB_API_KEY to your .env file.');
    }

    const uploadedUrls: string[] = [];
    for (const { file } of images) {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${IMGBB_API_URL}?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        uploadedUrls.push(data.data.url);
      } else {
        throw new Error(data.error?.message || 'Failed to upload image. Check API Key.');
      }
    }
    return uploadedUrls;
  };

  const onSubmit = async (data: CreatePostFormValues) => {
    try {
      setIsUploadingImages(true);
      let mediaUrls: string[] = [];

      if (images.length > 0) {
        toast.loading('Uploading images...', { id: 'upload' });
        mediaUrls = await uploadImagesToImgBB();
        toast.dismiss('upload');
      }

      const basePayload = {
        title: data.title,
        body: data.body || '',
        media: mediaUrls,
        community_id: community?.id ? Number(community.id) : undefined,
      };

      if (postType === 'discussion') {
        await createPost({ ...basePayload, post_type: 'discussion' }).unwrap();
      } else if (postType === 'news') {
        await createPost({ ...basePayload, post_type: 'news' }).unwrap();
      } else {
        await createOpportunityPost({
          ...basePayload,
          post_type: 'opportunity',
          org_name: data.org_name,
          location: data.location,
          deadline: data.deadline,
          apply_link: data.apply_link,
          opp_category: data.opp_category,
          skills_req: data.skills_req,
        }).unwrap();
      }

      toast.success('Post created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.dismiss('upload');
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <div className="w-full flex pt-6 pl-10 pb-20 bg-white min-h-screen">
      <div className="flex-1 max-w-[860px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-2">
          <h1 className="text-[32px] font-bold text-gray-900">Create post</h1>
          {/* <button className="text-[16px] font-bold text-gray-900 tracking-wide hover:underline">
            Drafts
          </button> */}
        </div>

        {/* Community Selector (Mocked) */}
        <div className="relative mb-8 w-[360px]">
          <button
            type="button"
            className="w-full flex items-center justify-between bg-white border border-gray-400 rounded-full py-3 px-5 hover:border-gray-500 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[16px] font-medium text-gray-800">
              {community ? `j/${community.name}` : 'Select Community'}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10 max-h-60 overflow-y-auto">
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map((c: any) => (
                  <button
                    key={c.community_id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setCommunity({ id: c.community_id, name: c.name });
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-[12px] font-bold text-blue-600">j/</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-[15px]">j/{c.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-[15px] font-medium text-gray-600 p-3 text-center">You haven't joined any communities yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Post Type Tabs */}
        <div className="flex border-b border-gray-200 mb-6 w-full max-w-[500px]">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${postType === 'discussion' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setPostType('discussion')}
          >
            <MessageSquare className="w-5 h-5" />
            Discussion
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${postType === 'opportunity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setPostType('opportunity')}
          >
            <Briefcase className="w-5 h-5" />
            Opportunity
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${postType === 'news' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setPostType('news')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
            </svg>
            News
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${postType === 'question' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setPostType('question')}
          >
            <HelpCircle className="w-5 h-5" />
            Question
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${postType === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setPostType('link')}
          >
            <LinkIcon className="w-5 h-5" />
            Link
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-col gap-4">

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Title Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Title"
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-[20px] px-5 py-4 text-[18px] focus:outline-none focus:border-gray-900 placeholder-gray-500 shadow-sm"
                {...register('title')}
              />
              {!titleValue && (
                <div className="absolute left-[62px] top-4 text-[18px] text-red-500 pointer-events-none">*</div>
              )}
              <div className="absolute right-4 -bottom-6 text-[12px] font-semibold text-gray-500">
                {titleValue.length}/300
              </div>
              {errors.title && <p className="text-red-500 text-xs mt-6">{errors.title.message}</p>}
            </div>

            {/* Opportunity specific fields */}
            {postType === 'opportunity' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Organization Name"
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 placeholder-gray-500"
                      {...register('org_name')}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Location (e.g., Remote, NY)"
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 placeholder-gray-500"
                      {...register('location')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Category (e.g., Internship, Job)"
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 placeholder-gray-500"
                      {...register('opp_category')}
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      placeholder="Deadline"
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 text-gray-700"
                      {...register('deadline')}
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Application Link (URL)"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 placeholder-gray-500"
                    {...register('apply_link')}
                  />
                  {errors.apply_link && <p className="text-red-500 text-xs mt-1">{errors.apply_link.message}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Skills Required (comma separated)"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-gray-900 placeholder-gray-500"
                    {...register('skills_req')}
                  />
                </div>
              </div>
            )}

            {/* Add Tags Pill */}
            {/* <div className="mt-3 mb-1">
              <span className="inline-block bg-gray-100 text-gray-400 text-[14px] font-bold px-5 py-2 rounded-full cursor-not-allowed">
                Add tags
              </span>
            </div> */}

            {/* Image Upload Button & Preview */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 4}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Upload Image (Max 4)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="p-3 bg-white flex gap-3 flex-wrap border border-gray-100 rounded-xl">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden group">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white mt-2 rounded-xl overflow-hidden border border-gray-300 focus-within:border-gray-900 transition-colors">
              <ReactQuill
                theme="snow"
                value={bodyValue}
                onChange={(content) => setValue('body', content, { shouldValidate: true })}
                modules={quillModules}
                placeholder="Description"
                className="w-full min-h-[260px] text-[16px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-5">
              {/* <button
                type="button"
                className="px-6 py-3 rounded-full text-[15px] font-bold text-gray-400 bg-gray-100 cursor-not-allowed"
                disabled
              >
                Save Draft
              </button> */}
              <button
                type="submit"
                disabled={!isValid || isLoading || isUploadingImages}
                className={`px-6 py-3 rounded-full text-[15px] font-bold transition-colors
                  ${isValid && !isLoading && !isUploadingImages ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {isLoading || isUploadingImages ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
