import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarkAsReadMutation } from '../../redux/features/notification/notificationApi';
import type { INotification } from '../../redux/features/notification/notificationApi';
import { formatTimeAgo } from '../../utils/time';
import { Mail, MailOpen } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

interface NotificationItemProps {
  notification: INotification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const [markAsRead] = useMarkAsReadMutation();
  const { user } = useAppSelector(state => state.auth);

  const handleClick = async () => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_id).unwrap();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    onClose();

    // Navigation logic
    switch (notification.type) {
      case 'USER_BAN':
      case 'USER_UNBAN':
        navigate(`/u/${user?.user_id || user?.userId}`);
        break;
      case 'COMMUNITY_BAN':
      case 'COMMUNITY_UNBAN':
        if (notification.community_id) {
          navigate(`/c/${notification.community_id}`);
        }
        break;
      case 'VOTE_POST':
      case 'COMMENT_POST':
      case 'REPLY_COMMENT':
      case 'ADMIN_DELETE_POST':
      case 'ADMIN_DELETE_COMMENT':
        if (notification.post_id) {
          navigate(`/post/${notification.post_id}`);
        }
        break;
      default:
        break;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'USER_BAN': return 'You have been banned from the platform by an admin.';
      case 'USER_UNBAN': return 'Your ban has been lifted by an admin.';
      case 'COMMUNITY_BAN': return 'A community you created has been banned by an admin.';
      case 'COMMUNITY_UNBAN': return 'A community you created has been unbanned.';
      case 'VOTE_POST': 
        return notification.vote_count && notification.vote_count > 1 
          ? `${notification.vote_count} people voted on your post.` 
          : 'Someone voted on your post.';
      case 'COMMENT_POST': return 'Someone commented on your post.';
      case 'REPLY_COMMENT': return 'Someone replied to your comment.';
      case 'ADMIN_DELETE_POST': return 'Your post was deleted by an admin.';
      case 'ADMIN_DELETE_COMMENT': return 'Your comment was deleted by an admin.';
      default: return 'You have a new notification.';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex gap-3 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
    >
      <div className="mt-1 shrink-0">
        {!notification.is_read ? (
          <Mail className="w-5 h-5 text-blue-500" />
        ) : (
          <MailOpen className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm text-gray-800 ${!notification.is_read ? 'font-semibold' : ''}`}>
          {getMessage()}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>
    </div>
  );
};

export default NotificationItem;
