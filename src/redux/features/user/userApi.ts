import { baseApi } from '../../api/baseApi';
import type { TResponse } from '../../../types/global';

export interface IUserProfile {
  out_username: string;
  karma_score: number;
  created_at: string;
  active_communities: number;
  followers: number;
  contributions: number;
}

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<TResponse<IUserProfile>, string>({
      query: (username) => ({
        url: `/users/${username}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUserProfileQuery } = userApi;
