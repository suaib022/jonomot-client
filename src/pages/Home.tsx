import { useState } from 'react';
import { PostFeed } from '../components/post/PostFeed';
import { useGetAllPostsQuery } from '../redux/features/post/postApi';
import { formatTimeAgo } from '../utils/time';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../redux/hooks';

export default function Home() {
  const { data: res } = useGetAllPostsQuery();
  const { user } = useAppSelector((state) => state.auth);
  const [filterType, setFilterType] = useState<string>('all');

  // Sort posts by date descending, take top 3
  const posts = res?.data || [];
  const recentPosts = [...posts].sort((a: any, b: any) => {
    const dateA = new Date(a.created_at || a.CREATED_AT).getTime();
    const dateB = new Date(b.created_at || b.CREATED_AT).getTime();
    return dateB - dateA;
  }).slice(0, 3);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'news', label: 'News' },
    { value: 'question', label: 'Question' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'link', label: 'Link' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col gap-6">
      {user?.is_banned && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2" role="alert">
          {/* <strong className="font-bold">Notice: </strong> */}
          <span className="block sm:inline">This account has been permanently banned</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === opt.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <PostFeed postType={filterType} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-[316px] shrink-0">
          <div className="bg-[#EAEDF0] rounded-[16px] p-4 mb-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-[16px] text-gray-900">Recent Posts</h2>
            </div>

            <div className="flex flex-col gap-5">
              {recentPosts.length === 0 ? (
                <p className="text-[13px] text-gray-500">No recent posts.</p>
              ) : (
                recentPosts.map((post: any) => {
                  const communityName = post.community_name || post.COMMUNITY_NAME || post.community_id || post.COMMUNITY_ID;
                  const upvotes = (post.upvote_count ?? (post as any).UPVOTE_COUNT) || 0;
                  const downvotes = (post.downvote_count ?? (post as any).DOWNVOTE_COUNT) || 0;
                  const comments = (post.comment_count ?? (post as any).COMMENT_COUNT) || 0;

                  return (
                    <Link key={post.post_id || post.POST_ID} to={`/post/${post.post_id || post.POST_ID}`} className="group cursor-pointer block">
                      <div className="flex items-center gap-2 mb-1.5">
                        {communityName ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              {String(communityName).charAt(0).toLowerCase()}/
                            </div>
                            <span
                              className="text-[13px] text-gray-500 hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/j/${communityName}`;
                              }}
                            >
                              j/{communityName}
                            </span>
                            <span className="text-[13px] text-gray-500">• {formatTimeAgo(post.created_at || post.CREATED_AT)}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                              u/
                            </div>
                            <span className="text-[13px] text-gray-500">
                              u/user_{post.user_id || post.USER_ID} • {formatTimeAgo(post.created_at || post.CREATED_AT)}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-gray-900 group-hover:underline leading-snug">
                        {post.title || post.TITLE}
                      </h3>
                      <p className="text-[13px] text-gray-500 mt-1">
                        {upvotes - downvotes} upvotes • {comments} comments
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
