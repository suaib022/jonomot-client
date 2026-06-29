import React from 'react';
import type { IComment } from '../../types/comment';
import { formatTimeAgo } from '../../utils/time';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

interface ProfileCommentCardProps {
  comment: IComment;
  username: string;
}

const ProfileCommentCard: React.FC<ProfileCommentCardProps> = ({ comment, username }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors mb-4 cursor-pointer shadow-sm">
      <Link to={`/post/${comment.post_id}`} className="block p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <span className="font-bold text-gray-700 mr-1">{username}</span> commented on 
          <span className="font-bold text-gray-900 ml-1 hover:underline truncate max-w-[300px]">
            {comment.post_title || `Post #${comment.post_id}`}
          </span>
          <span className="mx-1">•</span>
          <span>{formatTimeAgo(comment.created_at || new Date().toISOString())}</span>
        </div>
        
        <div className="pl-4 border-l-2 border-gray-200 ml-2">
          <div className="text-gray-800 text-sm py-2">
            {comment.body}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 font-bold mt-1">
            <span className="text-[#ff4500] flex items-center">
              <ArrowUp className="h-4 w-4 mr-1"/>
              {comment.upvote_count || 0}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProfileCommentCard;
