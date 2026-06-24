import React from 'react';
import { useGetAllPostsQuery } from '../../redux/features/post/postApi';
import { PostCard } from './PostCard';

export const PostFeed: React.FC<{ communityId?: number }> = ({ communityId }) => {
  const { data: res, isLoading, isError } = useGetAllPostsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-full h-32 bg-gray-100 animate-pulse border-b border-gray-200 mb-4 pb-4"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500 text-center">Failed to load posts.</div>;
  }

  let posts = res?.data || [];
  
  // Set fake counts to 0 after fetching
  posts = posts.map((p: any) => ({
    ...p,
    upvote_count: 0,
    downvote_count: 0,
    comment_count: 0,
    UPVOTE_COUNT: 0,
    DOWNVOTE_COUNT: 0,
    COMMENT_COUNT: 0
  }));

  if (communityId) {
    posts = posts.filter((p: any) => p.community_id === communityId || p.COMMUNITY_ID === communityId);
  }

  if (posts.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 border-b border-gray-200">
        No posts found.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, index, arr) => (
        <React.Fragment key={post.post_id}>
          <PostCard post={post} />
          {index < arr.length - 1 && <hr className="my-1 border-gray-200" />}
        </React.Fragment>
      ))}
    </div>
  );
};
