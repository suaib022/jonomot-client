import { baseApi } from '../../api/baseApi';
import type { TResponse } from '../../../types/global';

export interface IUserProfile {
  user_id: number;
  out_username: string;
  karma_score: number;
  created_at: string;
  active_communities: number;
  followers: number;
  contributions: number;
  role?: string;
  is_banned?: boolean;
}

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<TResponse<IUserProfile>, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUserProfileQuery } = userApi;
