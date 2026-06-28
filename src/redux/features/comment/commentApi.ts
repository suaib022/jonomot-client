import { baseApi } from '../../api/baseApi';
import type { TResponse } from '../../../types/global';
import type { IComment } from '../../../types/comment';

export type { IComment };


const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommentsByPost: builder.query<TResponse<IComment[]>, number>({
      query: (postId) => ({
        url: `/comments/post/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Comment', id: arg }],
    }),
    createComment: builder.mutation<TResponse<any>, { post_id: number; parent_comment_id?: number | null; body: string }>({
      query: (body) => ({
        url: '/comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Comment', id: arg.post_id }, 'Post'],
    }),
    deleteComment: builder.mutation<TResponse<any>, { id: number; postId: number }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Comment', id: arg.postId }, 'Post'],
    }),
  }),
});

export const { useGetCommentsByPostQuery, useCreateCommentMutation, useDeleteCommentMutation } = commentApi;
