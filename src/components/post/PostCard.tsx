import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { IPost } from '../../redux/features/post/postApi';
import { useDeletePostMutation, useToggleSavePostMutation } from '../../redux/features/post/postApi';
import { useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useGetMyVotesQuery, useCastVoteMutation } from '../../redux/features/vote/voteApi';

interface PostCardProps {
  post: IPost;
}

function formatTimeAgo(dateInput: Date | string | number) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  // Adjust for Oracle DB timestamp (UTC) being parsed as Local by node-oracledb
  // by adding the timezone offset back.
  const offset = new Date().getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - offset);
  
  const seconds = Math.floor((new Date().getTime() - adjustedDate.getTime()) / 1000);
  if (seconds < 0) return 'Just now';
  
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  interval = seconds / 604800;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " week ago" : " weeks ago");
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " min ago";
  return Math.floor(seconds) + " sec ago";
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const createdAt = post.created_at || (post as any).CREATED_AT;
  const timeStr = formatTimeAgo(createdAt);
  const communityName = (post as any).community_name || (post as any).COMMUNITY_NAME || (post as any).community_id || (post as any).COMMUNITY_ID;
  const upvotes = (post.upvote_count ?? (post as any).UPVOTE_COUNT) || 0;
  const downvotes = (post.downvote_count ?? (post as any).DOWNVOTE_COUNT) || 0;
  const userId = post.user_id || (post as any).USER_ID;
  const title = post.title || (post as any).TITLE;
  const body = post.body || (post as any).BODY;
  const media = post.media || (post as any).MEDIA;
  const comments = (post.comment_count ?? (post as any).COMMENT_COUNT) || 0;
  const postId = post.post_id || (post as any).POST_ID;

  const currentUser = useAppSelector((state) => state.auth.user);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [castVote] = useCastVoteMutation();
  const navigate = useNavigate();
  const { data: myVotesRes } = useGetMyVotesQuery(undefined, {
    skip: !currentUser, // only fetch if logged in
  });
  
  const [toggleSavePost] = useToggleSavePostMutation();

  const myVotes = myVotesRes?.data || [];
  const myVote = myVotes.find(v => v.TARGET_ID === postId && v.TARGET_TYPE === 'POST');

  const username = (post as any).username || (post as any).USERNAME;
  const displayUsername = username ? username : `user_${userId}`;

  const isOwner = (currentUser?.userId || (currentUser as any)?.user_id) == userId;
  const isAdmin = currentUser?.role === 'admin';
  console.log('PostCard Debug ->', {
    postUserId: userId, 
    currentUser: currentUser, 
    isOwner 
  });

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [body]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening post if clicking delete
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId).unwrap();
        toast.success('Post deleted successfully');
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to delete post');
      }
    }
  };

  const handleVote = async (e: React.MouseEvent, type: 1 | -1) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('You must be logged in to vote.');
      return;
    }
    if (isAdmin) {
      toast.error('Admins are not allowed to vote.');
      return;
    }
    try {
      await castVote({ target_id: postId, target_type: 'POST', vote_type: type }).unwrap();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to cast vote');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('You must be logged in to save posts.');
      return;
    }
    try {
      await toggleSavePost(postId).unwrap();
      toast.success('Saved status updated');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save post');
    }
  };

  return (
    <div 
      onClick={() => navigate(`/post/${postId}`)}
      className="cursor-pointer transition-colors flex bg-transparent rounded-[16px] p-4 hover:bg-[#EAEDF0]"
    >
      
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header: Community, User, Time */}
        <div className="flex items-center gap-1 text-[13px] text-gray-500 mb-2">
          {communityName && (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                 <span className="text-[10px] font-bold text-blue-600">j/</span>
              </div>
              <Link 
                to={`/j/${communityName}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-gray-900 hover:underline"
              >
                j/{communityName}
              </Link>
              <span className="mx-1">•</span>
            </>
          )}
          <span>
            Posted by <Link to={`/u/${displayUsername}`} onClick={(e) => e.stopPropagation()} className="hover:underline font-bold">u/{displayUsername}</Link>
          </span>
          <span className="mx-1">{timeStr}</span>
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-semibold text-gray-900 leading-snug mb-2 pr-4">
          {title}
        </h3>

        {/* Body Content */}
        {body && (
          <div className="mb-2">
            <div 
              ref={contentRef}
              className={`text-[15px] text-gray-700 quill-content break-words break-all whitespace-pre-wrap ${!isExpanded ? 'line-clamp-4' : ''}`} 
              dangerouslySetInnerHTML={{ __html: body }}
            />
            {isOverflowing && !isExpanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="text-blue-600 hover:underline text-[14px] mt-1 font-medium"
              >
                See more
              </button>
            )}
            {isExpanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="text-blue-600 hover:underline text-[14px] mt-1 font-medium"
              >
                See less
              </button>
            )}
          </div>
        )}

        {/* Media Carousel */}
        {media && media.length > 0 && (
          <div className="bg-black/5 rounded mb-2 overflow-hidden max-h-[500px] flex items-center justify-center relative group">
            <img src={media[currentImageIndex]} alt={`Post content ${currentImageIndex + 1}`} className="w-full h-auto object-contain max-h-[500px]" />
            
            {media.length > 1 && (
              <>
                {/* Left Arrow */}
                {currentImageIndex > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                
                {/* Right Arrow */}
                {currentImageIndex < media.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
                
                {/* Dots indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {media.map((_: any, idx: number) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Bar (Reddit new UI style pills) */}
        <div className="flex items-center gap-2 mt-2">
          {/* Upvote/Downvote Pill */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full h-9 transition-colors">
            <button 
              onClick={(e) => handleVote(e, 1)}
              className={`flex items-center justify-center w-8 h-full rounded-l-full hover:bg-gray-100 ${myVote?.VOTE_TYPE === 1 ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-600'}`}
            >
              <svg className="w-5 h-5" fill={myVote?.VOTE_TYPE === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l-5 7h3v11h4V10h3z" />
              </svg>
            </button>
            <span className={`text-[13px] font-bold px-1 ${myVote?.VOTE_TYPE === 1 ? 'text-orange-600' : myVote?.VOTE_TYPE === -1 ? 'text-indigo-600' : 'text-gray-900'}`}>
              {upvotes - downvotes}
            </span>
            <button 
              onClick={(e) => handleVote(e, -1)}
              className={`flex items-center justify-center w-8 h-full rounded-r-full hover:bg-gray-100 ${myVote?.VOTE_TYPE === -1 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              <svg className="w-5 h-5" fill={myVote?.VOTE_TYPE === -1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-5-7h3V3h4v11h3z" />
              </svg>
            </button>
          </div>

          {/* Comments Pill */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/post/${postId}`); }}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full h-9 px-3.5 text-[13px] font-bold text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            {comments}
          </button>
          
          {/* Share Pill */}
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full h-9 px-3.5 text-[13px] font-bold text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            Share
          </button>
          
          {/* Save Pill */}
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full h-9 px-3.5 text-[13px] font-bold text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>

          {/* Delete Button (Owner Only) */}
          {isOwner && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 ml-auto bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-full h-9 px-3.5 text-[13px] font-bold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
