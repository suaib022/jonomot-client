import { useGetPostsByTypeQuery } from '../redux/features/post/postApi';
import { PostCard } from '../components/post/PostCard';

export default function News() {
  const { data: res, isLoading } = useGetPostsByTypeQuery('news');
  const posts = res?.data || [];

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col md:flex-row gap-6">
      <div className="flex-1 w-full min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="text-gray-500 mt-1">Stay updated with the latest news and announcements.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 text-center border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No news yet</h3>
            <p className="text-gray-500">There are no news posts available at the moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post: any) => (
              <PostCard key={post.post_id || post.POST_ID} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-[316px] shrink-0">
        <div className="bg-[#EAEDF0] rounded-[16px] p-4 mb-4">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-[16px] text-gray-900">About News</h2>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            This section is dedicated to news, announcements, and important updates. Check back regularly to stay informed.
          </p>
        </div>
      </div>
    </div>
  );
}
