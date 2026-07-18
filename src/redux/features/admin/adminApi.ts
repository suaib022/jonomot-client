import { baseApi } from '../../api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<any, void>({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getAllCommunitiesAdmin: builder.query<any, void>({
      query: () => '/admin/communities',
      providesTags: ['Community'],
    }),
    getAllPostsAdmin: builder.query<any, void>({
      query: () => '/admin/posts',
      providesTags: ['Post'],
    }),
    toggleUserBan: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/admin/users/${userId}/ban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    promoteUser: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/admin/users/${userId}/promote`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    toggleCommunityBan: builder.mutation<any, number>({
      query: (communityId) => ({
        url: `/admin/communities/${communityId}/ban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Community'],
    }),
    deletePostAdmin: builder.mutation<any, number>({
      query: (postId) => ({
        url: `/admin/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAllCommunitiesAdminQuery,
  useGetAllPostsAdminQuery,
  useToggleUserBanMutation,
  usePromoteUserMutation,
  useToggleCommunityBanMutation,
  useDeletePostAdminMutation,
} = adminApi;
