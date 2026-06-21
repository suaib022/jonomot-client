import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { CreateCommunityModal } from '../community/CreateCommunityModal';
import { useGetAllCommunitiesQuery, useJoinCommunityMutation, useGetJoinedCommunitiesQuery } from '../../redux/features/community/communityApi';
import { useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';

interface LeftSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [showAllCommunities, setShowAllCommunities] = React.useState(false);
  const { data: communitiesResponse } = useGetAllCommunitiesQuery(undefined);
  const user = useAppSelector((state) => state.auth.user);
  const { data: joinedCommunitiesResponse } = useGetJoinedCommunitiesQuery(undefined, { skip: !user });
  const [joinCommunity] = useJoinCommunityMutation();

  const rawCommunities = communitiesResponse?.data || [];
  const joinedCommunities = joinedCommunitiesResponse?.data || [];
  
  const communities = [...rawCommunities].sort((a: any, b: any) => {
    const aJoined = joinedCommunities.some((jc: any) => jc.community_id === a.community_id) ? 1 : 0;
    const bJoined = joinedCommunities.some((jc: any) => jc.community_id === b.community_id) ? 1 : 0;
    return bJoined - aJoined;
  });

  const visibleCommunities = showAllCommunities ? communities : communities.slice(0, 5);

  const handleJoin = async (e: React.MouseEvent, communityId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('You must be logged in to join a community');
      return;
    }
    try {
      await joinCommunity(communityId).unwrap();
      toast.success('Joined community');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to join community');
    }
  };

  const links = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Popular', path: '/popular', icon: 'popular' },
    { name: 'News', path: '/news', icon: 'news' },
  ];

  const getIcon = (type: string, active: boolean) => {
    switch (type) {
      case 'home':
        return (
          <svg className={`w-6 h-6 stroke-current ${active ? 'text-primary' : 'text-gray-700'} fill-none`} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        );
      case 'popular':
        return (
          <svg className={`w-6 h-6 stroke-current ${active ? 'text-primary' : 'text-gray-700'} fill-none`} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        );
      case 'news':
        return (
          <svg className={`w-6 h-6 stroke-current ${active ? 'text-primary' : 'text-gray-700'} fill-none`} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 6h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5h2.828c.22 0 .434.088.586.244l2.252 2.253a.825.825 0 01.242.586v8.467c0 .621-.504 1.125-1.125 1.125h-4.875M16.5 7.5V18m0-10.5h-8.25a2.25 2.25 0 00-2.25 2.25v8.25m8.25-10.5v10.5m-8.25-10.5H5.625c-.621 0-1.125.504-1.125 1.125v8.25" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-14 left-0 bottom-0 overflow-y-auto border-r border-gray-200 bg-white hidden lg:block pb-12 transition-[width] duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[270px]'}`}>

      {/* Toggle button container */}
      <div className={`pt-4 pb-2 flex ${isCollapsed ? 'justify-center' : 'justify-end pr-4'}`}>
        <button
          onClick={onToggleCollapse}
          className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-600 transition-colors z-10"
          title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 mt-2 px-3">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 py-3 rounded-lg transition-colors ${isCollapsed ? 'px-0 justify-center' : 'px-4'} ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              title={isCollapsed ? link.name : undefined}
            >
              {getIcon(link.icon, isActive)}
              {!isCollapsed && <span className="text-[15px] whitespace-nowrap">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-gray-200 pt-4">
        {!isCollapsed && (
          <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Communities</p>
        )}

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`w-full flex items-center gap-3 py-2 mt-1 mb-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Start a community" : undefined}
        >
          <div className="w-8 h-8 flex items-center justify-center text-gray-700 shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          {!isCollapsed && <span className="text-[15px] whitespace-nowrap">Start a community</span>}
        </button>

        {visibleCommunities.map((community: any) => {
          if (!community || !community.name) return null;
          
          const isJoined = joinedCommunities.some(
            (jc: any) => jc.community_id === community.community_id
          );

          return (
            <Link
              key={community.community_id}
              to={`/j/${community.name}`}
              className={`flex items-center justify-between group py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              title={isCollapsed ? `j/${community.name}` : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[13px] shrink-0">
                  {community.name.charAt(0).toLowerCase()}
                </div>
                {!isCollapsed && <span className="text-[14px] whitespace-nowrap overflow-hidden text-ellipsis">j/{community.name}</span>}
              </div>

              {!isCollapsed && !isJoined && (
                <button
                  onClick={(e) => handleJoin(e, community.community_id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                  title="Join Community"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </Link>
          );
        })}

        {!isCollapsed && communities.length > 5 && (
          <button
            onClick={() => setShowAllCommunities(!showAllCommunities)}
            className="w-full text-left px-4 py-2 mt-2 text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            {showAllCommunities ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
