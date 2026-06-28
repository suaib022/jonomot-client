import React, { useState, useMemo } from 'react';
import type { IComment } from '../../types/comment';
import { useGetCommentsByPostQuery, useCreateCommentMutation } from '../../redux/features/comment/commentApi';
import { useAppSelector } from '../../redux/hooks';
import { CommentItem } from './CommentItem';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: res, isLoading } = useGetCommentsByPostQuery(postId);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [commentBody, setCommentBody] = useState('');

  const comments = res?.data || [];

  // Build flat comment threads
  const commentThreads = useMemo(() => {
    const threads: (IComment & { replies: IComment[] })[] = [];
    const rootMap = new Map<number, number>(); // Maps comment_id to its ultimate root_id
    const threadMap = new Map<number, IComment & { replies: IComment[] }>();

    comments.forEach(c => {
      const id = c.comment_id || c.COMMENT_ID!;
      const parentId = c.parent_comment_id || c.PARENT_COMMENT_ID;

      if (!parentId) {
        // Root comment
        const thread = { ...c, replies: [] };
        threads.push(thread);
        threadMap.set(id, thread);
        rootMap.set(id, id);
      } else {
        // Find ultimate root
        let rootId = rootMap.get(parentId);
        if (rootId) {
          rootMap.set(id, rootId);
          threadMap.get(rootId)?.replies.push(c);
        } else {
          // Fallback if parent missing
          const thread = { ...c, replies: [] };
          threads.push(thread);
          threadMap.set(id, thread);
          rootMap.set(id, id);
        }
      }
    });

    return threads;
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Admins are not allowed to comment');
      return;
    }
    if (!commentBody.trim()) {
      return;
    }

    try {
      await createComment({ post_id: postId, body: commentBody }).unwrap();
      setCommentBody('');
      toast.success('Comment posted');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to post comment');
    }
  };

  const isDisabled = !user || user.role === 'admin';

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder={isDisabled ? 'You cannot comment' : 'What are your thoughts?'}
          disabled={isDisabled || isCreating}
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y disabled:bg-gray-100"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isDisabled || isCreating || !commentBody.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-gray-500">Loading comments...</div>
      ) : commentThreads.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {commentThreads.map((thread) => (
            <CommentItem key={thread.comment_id || thread.COMMENT_ID} comment={thread} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};
