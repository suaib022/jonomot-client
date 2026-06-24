import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronDown, Image as ImageIcon, Link as LinkIcon, List as ListIcon, Bold, Italic, Strikethrough, Superscript, Type, Video, ListOrdered, Quote, Code, SquareSlash, Table, MoreHorizontal, X } from 'lucide-react';
import { useCreatePostMutation } from '../redux/features/post/postApi';
import { useGetJoinedCommunitiesQuery } from '../redux/features/community/communityApi';
import { useAppSelector } from '../redux/hooks';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ImgBB API endpoint
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be 300 characters or less'),
  body: z.string().optional(),
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

  const [createPost, { isLoading }] = useCreatePostMutation();
  const [selectedTab, setSelectedTab] = useState<'text' | 'images' | 'link' | 'poll'>('text');
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

      const payload = {
        title: data.title,
        body: data.body || '',
        post_type: 'discussion' as const,
        media: mediaUrls,
        community_id: community?.id ? Number(community.id) : undefined,
      };

      await createPost(payload).unwrap();
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

        {/* Tabs Removed */}

        {/* Main Editor Area */}
        <div className="flex flex-col gap-4">

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Title Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Title"
                className="w-full border border-gray-300 rounded-[20px] px-5 py-4 text-[18px] focus:outline-none focus:border-gray-900 placeholder-gray-500 shadow-sm"
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
