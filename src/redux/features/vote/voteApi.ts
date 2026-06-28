import { baseApi } from '../../api/baseApi';

export interface IVotePayload {
  target_id: number;
  target_type: 'POST' | 'COMMENT';
  vote_type: 1 | -1;
}

export interface IVoteResponse {
  vote_id: number | null;
  target_id: number;
  vote_type: number;
}

export interface IMyVote {
  TARGET_ID: number;
  TARGET_TYPE: string;
  VOTE_TYPE: number;
}

const voteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyVotes: builder.query<{ success: boolean; data: IMyVote[] }, void>({
      query: () => ({
        url: '/votes/my-votes',
        method: 'GET',
      }),
      providesTags: ['Vote'],
    }),
    castVote: builder.mutation<{ success: boolean; message: string; data: IVoteResponse }, IVotePayload>({
      query: (data) => ({
        url: '/votes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vote', 'Post'], // Invalidate Post to refresh vote counts
    }),
  }),
});

export const { useGetMyVotesQuery, useCastVoteMutation } = voteApi;
