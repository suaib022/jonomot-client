import { baseApi } from '../../api/baseApi';
import type { TResponse } from '../post/postApi';

export interface INotification {
  notification_id: number;
  user_id: number;
  actor_id: number;
  type: 'VOTE_POST' | 'VOTE_COMMENT' | 'COMMENT_POST' | 'REPLY_COMMENT' | 'MENTION' | 'USER_BAN' | 'USER_UNBAN' | 'COMMUNITY_BAN' | 'COMMUNITY_UNBAN' | 'ADMIN_DELETE_POST' | 'ADMIN_DELETE_COMMENT';
  post_id?: number;
  comment_id?: number;
  community_id?: number;
  is_read: boolean;
  created_at: string;
  actor_username: string;
  actor_profile_picture?: string;
  vote_count?: number;
}

let lastProcessedNotificationId = 0;

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<TResponse<INotification[]>, void>({
      query: () => ({
        url: '/notifications',
        method: 'GET',
      }),
      providesTags: ['Notification'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const notifications = data?.data || [];
          
          const newNotifications = notifications.filter((n: INotification) => n.notification_id > lastProcessedNotificationId);
          
          if (newNotifications.length > 0) {
            const tagsToInvalidate = new Set<string>();
            
            newNotifications.forEach((n: INotification) => {
              lastProcessedNotificationId = Math.max(lastProcessedNotificationId, n.notification_id);
              
              if (['USER_BAN', 'USER_UNBAN'].includes(n.type)) tagsToInvalidate.add('User');
              if (['COMMUNITY_BAN', 'COMMUNITY_UNBAN'].includes(n.type)) tagsToInvalidate.add('Community');
              if (['ADMIN_DELETE_POST', 'VOTE_POST', 'COMMENT_POST', 'ADMIN_DELETE_COMMENT'].includes(n.type)) tagsToInvalidate.add('Post');
              if (['COMMENT_POST', 'VOTE_COMMENT', 'REPLY_COMMENT', 'ADMIN_DELETE_COMMENT', 'MENTION'].includes(n.type)) tagsToInvalidate.add('Comment');
            });

            if (tagsToInvalidate.size > 0) {
              dispatch(baseApi.util.invalidateTags(Array.from(tagsToInvalidate) as any));
            }
          }
        } catch (err) {
          // Silent catch
        }
      },
    }),
    markAsRead: builder.mutation<TResponse<void>, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<TResponse<void>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
