import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserProfileQuery } from '../../redux/features/user/userApi';
import { 
  useGetPostsByUsernameQuery, 
  useGetUpvotedPostsQuery, 
  useGetDownvotedPostsQuery, 
  useGetSavedPostsQuery 
} from '../../redux/features/post/postApi';
import { useGetCommentsByUsernameQuery } from '../../redux/features/comment/commentApi';

import { PostCard } from '../../components/post/PostCard';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import ProfileRightSidebar from '../../components/profile/ProfileRightSidebar';
import ProfileCommentCard from '../../components/profile/ProfileCommentCard';

type TabType = 'OVERVIEW' | 'POSTS' | 'COMMENTS' | 'SAVED' | 'UPVOTED' | 'DOWNVOTED';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  // Queries
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(username || '');
  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUsernameQuery(username || '');
  const { data: commentsData, isLoading: isCommentsLoading } = useGetCommentsByUsernameQuery(username || '');
  const { data: upvotedData, isLoading: isUpvotedLoading } = useGetUpvotedPostsQuery(username || '');
  const { data: downvotedData, isLoading: isDownvotedLoading } = useGetDownvotedPostsQuery(username || '');
  const { data: savedData, isLoading: isSavedLoading } = useGetSavedPostsQuery(username || '');

  if (isProfileLoading) {
    return <div className="min-h-screen bg-white flex justify-center items-center text-gray-900">Loading...</div>;
  }

  const profile = profileData?.data;

  if (!profile) {
    return <div className="min-h-screen bg-white flex justify-center items-center text-gray-900">User not found.</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'POSTS':
        if (isPostsLoading) return <div className="text-gray-900 text-center mt-8">Loading posts...</div>;
        if (!postsData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No posts yet</div>;
        return postsData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'COMMENTS':
        if (isCommentsLoading) return <div className="text-gray-900 text-center mt-8">Loading comments...</div>;
        if (!commentsData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No comments yet</div>;
        return commentsData.data.map(comment => <ProfileCommentCard key={comment.comment_id} comment={comment} username={username || ''} />);
      
      case 'SAVED':
        if (isSavedLoading) return <div className="text-gray-900 text-center mt-8">Loading saved posts...</div>;
        if (!savedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No saved posts</div>;
        return savedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'UPVOTED':
        if (isUpvotedLoading) return <div className="text-gray-900 text-center mt-8">Loading upvoted posts...</div>;
        if (!upvotedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No upvoted posts</div>;
        return upvotedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'DOWNVOTED':
        if (isDownvotedLoading) return <div className="text-gray-900 text-center mt-8">Loading downvoted posts...</div>;
        if (!downvotedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No downvoted posts</div>;
        return downvotedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'OVERVIEW':
      default:
        // Combine posts and comments and sort by created_at descending
        const combined = [
          ...(postsData?.data || []).map(p => ({ ...p, _type: 'POST', _date: new Date(p.created_at || 0).getTime() })),
          ...(commentsData?.data || []).map(c => ({ ...c, _type: 'COMMENT', _date: new Date(c.created_at || 0).getTime() }))
        ].sort((a, b) => b._date - a._date);

        if (isPostsLoading || isCommentsLoading) return <div className="text-gray-900 text-center mt-8">Loading overview...</div>;
        if (combined.length === 0) return <div className="text-gray-500 text-center mt-8 font-bold">Hmm... u/{username} hasn't posted anything</div>;

        return combined.map((item: any) => {
          if (item._type === 'POST') {
            return <PostCard key={`post-${item.post_id}`} post={item} />;
          } else {
            return <ProfileCommentCard key={`comment-${item.comment_id}`} comment={item} username={username || ''} />;
          }
        });
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col md:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        <ProfileHeader username={profile.out_username} />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-4 space-y-4">
          {renderContent()}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-[316px] shrink-0">
        <ProfileRightSidebar profile={profile} />
      </div>
    </div>
  );
};

export default Profile;
