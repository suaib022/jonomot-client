import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import type { IUserProfile } from '../../redux/features/user/userApi';
import { formatTimeAgo } from '../../utils/time';

interface ProfileHeaderProps {
  profile: IUserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const redditAge = formatTimeAgo(profile.created_at);

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Section: Avatar & Info */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-sm shrink-0">
            u/
          </div>
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight break-all">
                User_{profile.user_id}
              </h1>
              {profile.role === 'admin' && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[14px] text-gray-500 mt-1">
              u/User_{profile.user_id}
            </p>
          </div>
        </div>

        {/* Right Section: Stats */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          {profile.role !== 'admin' && (
            <>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-lg leading-tight">{profile.followers}</span>
                <span className="text-gray-500 text-xs font-semibold">Followers</span>
              </div>
              
              <div className="flex items-start gap-2">
                <Sparkles className="text-[#3690ff] h-5 w-5 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-lg leading-tight">{profile.karma_score}</span>
                  <span className="text-gray-500 text-xs font-semibold">Karma</span>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-start gap-2">
            <Calendar className="text-[#3690ff] h-5 w-5 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-lg leading-tight">{redditAge}</span>
              <span className="text-gray-500 text-xs font-semibold">Jonomot age</span>
            </div>
          </div>

          {profile.role !== 'admin' && (
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs mt-0.5">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-lg leading-tight">{profile.active_communities}</span>
                <span className="text-gray-500 text-xs font-semibold">Active in communities</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
