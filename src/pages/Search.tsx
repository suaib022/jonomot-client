import { useSearchParams } from 'react-router-dom';
import { useSearchPostsQuery } from '../redux/features/post/postApi';
import { PostCard } from '../components/post/PostCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { data: res, isLoading, isError } = useSearchPostsQuery(query, {
    skip: !query
  });

  const posts = res?.data || [];

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 pt-6 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 mt-1">Showing results for "{query}"</p>
      </div>

      <div className="flex flex-col">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-32 bg-gray-100 animate-pulse rounded-lg mb-4"></div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            Error loading search results.
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && query && (
          <div className="p-10 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            No posts found matching "{query}".
          </div>
        )}
        
        {!query && (
          <div className="p-10 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            Please enter a search query.
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="flex flex-col">
            {posts.map((post: any, index: number, arr: any[]) => (
              <div key={post.post_id || post.POST_ID}>
                <PostCard post={post} />
                {index < arr.length - 1 && <hr className="my-1 border-gray-200" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
