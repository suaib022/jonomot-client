import { baseApi } from '../../api/baseApi';

export interface IPost {
  post_id?: number;
  user_id: number;
  title: string;
  body: string;
  post_type: 'discussion' | 'news' | 'question' | 'opportunity' | 'link' | 'media' | 'poll';
  media?: string[];
  upvote_count?: number;
  downvote_count?: number;
  comment_count?: number;
  is_removed?: boolean;
  community_id?: number;
  community_name?: string;
  created_at?: string;
  updated_at?: string;
  // Opportunity Fields
  org_name?: string;
  location?: string;
  deadline?: string;
  apply_link?: string;
  opp_category?: string;
  skills_req?: string;
  is_verified?: boolean;
}

export interface TResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPosts: builder.query<TResponse<IPost[]>, void>({
      query: () => ({
        url: '/posts',
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    searchPosts: builder.query<TResponse<IPost[]>, string>({
      query: (q) => ({
        url: `/posts/search?q=${encodeURIComponent(q)}`,
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    getPostsByType: builder.query<TResponse<IPost[]>, string>({
      query: (type) => ({
        url: `/posts/type/${type}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, _type) => [{ type: 'Post', id: `TYPE_${_type}` }, 'Post'],
    }),
    getPostById: builder.query<TResponse<IPost>, string | number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Post', id: arg }],
    }),
    createPost: builder.mutation<TResponse<{ post_id: number }>, Partial<IPost>>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    createOpportunityPost: builder.mutation<TResponse<{ post_id: number }>, Partial<IPost>>({
      query: (data) => ({
        url: '/posts/opportunity',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    deletePost: builder.mutation<TResponse<void>, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
    getPostsByUsername: builder.query<TResponse<IPost[]>, string>({
      query: (username) => ({
        url: `/posts/user/${username}`,
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    getUpvotedPosts: builder.query<TResponse<IPost[]>, string>({
      query: (username) => ({
        url: `/posts/user/${username}/upvoted`,
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    getDownvotedPosts: builder.query<TResponse<IPost[]>, string>({
      query: (username) => ({
        url: `/posts/user/${username}/downvoted`,
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    getSavedPosts: builder.query<TResponse<IPost[]>, string>({
      query: (username) => ({
        url: `/posts/user/${username}/saved`,
        method: 'GET',
      }),
      providesTags: ['SavedPost'],
    }),
    toggleSavePost: builder.mutation<TResponse<void>, number>({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['SavedPost'],
    }),
  }),
});

export const { 
  useGetAllPostsQuery,
  useSearchPostsQuery,
  useGetPostsByTypeQuery,
  useGetPostByIdQuery, 
  useCreatePostMutation, 
  useCreateOpportunityPostMutation,
  useDeletePostMutation,
  useGetPostsByUsernameQuery,
  useGetUpvotedPostsQuery,
  useGetDownvotedPostsQuery,
  useGetSavedPostsQuery,
  useToggleSavePostMutation
} = postApi;
