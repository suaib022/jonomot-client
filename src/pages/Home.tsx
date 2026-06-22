import { PostFeed } from '../components/post/PostFeed';
import { useGetAllPostsQuery } from '../redux/features/post/postApi';
import { formatTimeAgo } from '../utils/time';
import { Link } from 'react-router-dom';

export default function Home() {
  const { data: res } = useGetAllPostsQuery();
  
  // Sort posts by date descending, take top 3
  const posts = res?.data || [];
  const recentPosts = [...posts].sort((a: any, b: any) => {
    const dateA = new Date(a.created_at || a.CREATED_AT).getTime();
    const dateB = new Date(b.created_at || b.CREATED_AT).getTime();
    return dateB - dateA;
  }).slice(0, 3);

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col md:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        <PostFeed />
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-[316px] shrink-0">
        <div className="bg-[#EAEDF0] rounded-[16px] p-4 mb-4">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-[16px] text-gray-900">Recent Posts</h2>
            <button className="text-[13px] font-medium text-blue-600 hover:underline">Clear</button>
          </div>
          
          <div className="flex flex-col gap-5">
            {recentPosts.length === 0 ? (
              <p className="text-[13px] text-gray-500">No recent posts.</p>
            ) : (
              recentPosts.map((post: any) => {
                const communityName = post.community_name || post.COMMUNITY_NAME || post.community_id || post.COMMUNITY_ID;
                const upvotes = 0; // Fake engagement reset
                const comments = 0; // Fake engagement reset
                
                return (
                  <div key={post.post_id || post.POST_ID} className="group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5">
                      {communityName ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {String(communityName).charAt(0).toLowerCase()}/
                          </div>
                          <Link to={`/j/${communityName}`} className="text-[13px] text-gray-500 hover:underline">
                            j/{communityName}
                          </Link>
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
                      {upvotes} upvotes • {comments} comments
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
