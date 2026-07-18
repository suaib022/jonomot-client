import React from 'react';
import type { IUserProfile } from '../../redux/features/user/userApi';
import { formatTimeAgo } from '../../utils/time';
import { Share, Calendar, Sparkles } from 'lucide-react';
import ShareModal from '../ui/ShareModal';

interface ProfileRightSidebarProps {
  profile: IUserProfile;
}

const ProfileRightSidebar: React.FC<ProfileRightSidebarProps> = ({ profile }) => {
  const redditAge = formatTimeAgo(profile.created_at);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  return (
    <div className="bg-[#EAEDF0] rounded-[16px] p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 font-bold text-[16px]">u/User_{profile.user_id}</h2>
      </div>

      <button 
        onClick={() => setIsShareModalOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 px-4 flex items-center justify-center font-bold text-sm mb-6 transition-colors"
      >
        <Share className="mr-2 h-5 w-5" /> Share Profile
      </button>

      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-gray-900 font-bold text-lg">{profile.followers}</span>
          <span className="text-gray-500 text-xs font-semibold">Followers</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 text-sm">
        <div className="flex items-start">
          <Sparkles className="text-[#3690ff] h-5 w-5 mt-0.5 mr-2" />
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold">{profile.karma_score}</span>
            <span className="text-gray-500 text-xs font-semibold">Karma</span>
          </div>
        </div>
        <div className="flex items-start">
          <Calendar className="text-[#3690ff] h-6 w-6 mt-0.5 mr-2" />
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold">{redditAge}</span>
            <span className="text-gray-500 text-xs font-semibold">Jonomot age</span>
          </div>
        </div>
        <div className="flex items-start">
          <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs mt-0.5 mr-2">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold">{profile.active_communities}</span>
            <span className="text-gray-500 text-xs font-semibold">Active in communities</span>
          </div>
        </div>
      </div>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={`${window.location.origin}/u/${profile.user_id}`} 
        title={`Check out u/User_${profile.user_id}'s profile on Jonomot`}
      />
    </div>
  );
};

export default ProfileRightSidebar;
