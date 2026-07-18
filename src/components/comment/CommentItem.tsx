import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { IComment } from '../../types/comment';
import { useCreateCommentMutation, useDeleteCommentMutation } from '../../redux/features/comment/commentApi';
import { useToggleUserBanMutation } from '../../redux/features/admin/adminApi';
import { useAppSelector } from '../../redux/hooks';
import { formatTimeAgo } from '../../utils/time';
import { MessageSquare, Trash2, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: IComment & { replies?: IComment[] };
  postId: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, postId }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [toggleUserBan] = useToggleUserBanMutation();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isReplying && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          const length = textareaRef.current.value.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [isReplying]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    try {
      await createComment({ 
        post_id: postId, 
        parent_comment_id: comment.comment_id || comment.COMMENT_ID, 
        body: replyBody 
      }).unwrap();
      setReplyBody('');
      setIsReplying(false);
      toast.success('Reply posted');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to post reply');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({ id: Number(comment.comment_id || comment.COMMENT_ID || 0), postId }).unwrap();
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete comment');
    }
  };

  const handleBanUser = async () => {
    if (!window.confirm(`Are you sure you want to ban ${username}?`)) return;
    try {
      await toggleUserBan(Number(comment.user_id || comment.USER_ID)).unwrap();
      toast.success('User banned');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to ban user');
    }
  };

  const isBanned = user?.is_banned;
  const isDisabled = !user || user.role === 'admin' || isBanned;
  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.userId || (user as any)?.user_id;
  const commentUserId = comment.user_id || comment.USER_ID;
  const isOwner = !!currentUserId && currentUserId === commentUserId;
  const isRemoved = comment.is_removed || comment.IS_REMOVED;
  const username = `User_${commentUserId}`;
  const timeAgo = formatTimeAgo(comment.created_at || comment.CREATED_AT || new Date().toISOString());
  const body = comment.body || comment.BODY || '';

  return (
    <div className="flex flex-col">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-600">
          U
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[13px] text-gray-900">
              {username}
            </span>
            <span className="text-[12px] text-gray-500">• {timeAgo}</span>
          </div>
          
          <div className="text-[14px] text-gray-800 break-words mb-2 whitespace-pre-wrap">
            {isRemoved ? <span className="italic text-gray-400">[comment removed]</span> : body}
          </div>

          {!isRemoved && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('You must be logged in to reply');
                    return;
                  }
                  if (isAdmin) {
                    toast.error('Admins are not allowed to reply');
                    return;
                  }
                  if (isBanned) {
                    toast.error('Banned users are not allowed to reply');
                    return;
                  }
                  setIsReplying(!isReplying);
                }}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100 px-2 py-1 -ml-2 rounded transition-colors disabled:opacity-50"
                disabled={isDisabled}
              >
                <MessageSquare className="w-4 h-4" />
                Reply
              </button>
              
              {(isOwner || isAdmin) && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              {isAdmin && !isOwner && (
                <button
                  onClick={handleBanUser}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-orange-600 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Ban User
                </button>
              )}
            </div>
          )}

          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 mb-2 pr-4">
              <textarea
                ref={textareaRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply..."
                disabled={isCreating}
                className="w-full bg-white text-gray-900 min-h-[80px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !replyBody.trim()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 flex flex-col gap-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.comment_id || reply.COMMENT_ID} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};
