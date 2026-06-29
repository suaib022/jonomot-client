import React from 'react';

type TabType = 'OVERVIEW' | 'POSTS' | 'COMMENTS' | 'SAVED' | 'UPVOTED' | 'DOWNVOTED';

interface ProfileTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'POSTS', label: 'Posts' },
    { id: 'COMMENTS', label: 'Comments' },
    { id: 'SAVED', label: 'Saved' },
    { id: 'UPVOTED', label: 'Upvoted' },
    { id: 'DOWNVOTED', label: 'Downvoted' },
  ];

  return (
    <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-xl px-2 pt-2 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-[14px] font-bold transition-colors whitespace-nowrap border-b-2 -mb-px
            ${activeTab === tab.id 
              ? 'text-blue-600 border-blue-600 bg-blue-50/50 rounded-t-lg' 
              : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700 rounded-t-lg'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
