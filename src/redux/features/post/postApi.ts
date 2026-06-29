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
      providesTags: ['Post'],
    }),
    toggleSavePost: builder.mutation<TResponse<void>, number>({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const { 
  useGetAllPostsQuery, 
  useGetPostByIdQuery, 
  useCreatePostMutation, 
  useDeletePostMutation,
  useGetPostsByUsernameQuery,
  useGetUpvotedPostsQuery,
  useGetDownvotedPostsQuery,
  useGetSavedPostsQuery,
  useToggleSavePostMutation
} = postApi;
