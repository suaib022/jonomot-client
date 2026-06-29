import React from 'react';

interface ProfileHeaderProps {
  username: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ username }) => {
  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-sm shrink-0">
          u/
        </div>
        <div className="flex-1 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight break-all">
              {username}
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              u/{username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
