import { baseApi } from '../../api/baseApi';

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCommunity: builder.mutation({
      query: (data) => ({
        url: '/communities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Community'],
    }),
    getAllCommunities: builder.query({
      query: () => '/communities',
      providesTags: ['Community'],
    }),
    getJoinedCommunities: builder.query({
      query: () => '/communities/joined',
      providesTags: ['Community'],
    }),
    getCommunityByName: builder.query({
      query: (name) => `/communities/${name}`,
      providesTags: (_result, _error, name) => [{ type: 'Community', id: name }],
    }),
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Community'],
    }),
    leaveCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Community'],
    }),
    getCommunityMembers: builder.query({
      query: (communityId) => `/communities/${communityId}/members`,
      providesTags: (_result, _error, id) => [{ type: 'Community', id: `members-${id}` }],
    }),
    updateMemberRole: builder.mutation({
      query: ({ communityId, userId, role }) => ({
        url: `/communities/${communityId}/role`,
        method: 'PATCH',
        body: { user_id: userId, role },
      }),
      invalidatesTags: (_result, _error, { communityId }) => [{ type: 'Community', id: `members-${communityId}` }],
    }),
    removeMember: builder.mutation({
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { communityId }) => [{ type: 'Community', id: `members-${communityId}` }],
    }),
  }),
});

export const {
  useCreateCommunityMutation,
  useGetAllCommunitiesQuery,
  useGetJoinedCommunitiesQuery,
  useGetCommunityByNameQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useGetCommunityMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = communityApi;
