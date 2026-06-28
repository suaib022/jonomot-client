import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostByIdQuery } from '../redux/features/post/postApi';
import { PostCard } from '../components/post/PostCard';
import { CommentSection } from '../components/comment/CommentSection';
import { ArrowLeft } from 'lucide-react';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const { data: res, isLoading, isError } = useGetPostByIdQuery(postId || '');
  
  const post = res?.data;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 pt-6 pb-12">
        <div className="w-full h-32 bg-gray-100 animate-pulse rounded-[16px]"></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 pt-6 pb-12 text-center text-red-500">
        Failed to load post.
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 pt-6 pb-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      {/* Render the post itself */}
      <div className="bg-[#EAEDF0] rounded-[16px] mb-6">
         <PostCard post={post} />
      </div>

      {/* Render comments */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Comments</h2>
        <CommentSection postId={Number(postId)} />
      </div>
    </div>
  );
}
