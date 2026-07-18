import { useParams, useNavigate } from 'react-router-dom';
import { useGetAllCommunitiesQuery, useJoinCommunityMutation, useLeaveCommunityMutation, useGetJoinedCommunitiesQuery, useGetCommunityMembersQuery } from '../redux/features/community/communityApi';
import { useAppSelector } from '../redux/hooks';
import { Plus, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PostFeed } from '../components/post/PostFeed';

const Community = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const navigate = useNavigate();
  const { data: communitiesResponse, isLoading } = useGetAllCommunitiesQuery(undefined);
  const user = useAppSelector((state) => state.auth.user);
  const { data: joinedCommunitiesResponse } = useGetJoinedCommunitiesQuery(undefined, { skip: !user });
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();

  const joinedCommunities = joinedCommunitiesResponse?.data || [];

  // Find the community by name
  const community = communitiesResponse?.data?.find(
    (c: any) => c.name.toLowerCase() === communityName?.toLowerCase()
  );

  const isJoined = joinedCommunities.some(
    (jc: any) => jc.community_id === community?.community_id
  );

  const { data: membersResponse } = useGetCommunityMembersQuery(community?.community_id, {
    skip: !community,
  });
  const membersCount = membersResponse?.data?.length || 0;

  console.log("Community:", community);
  console.log("Joined Communities:", joinedCommunities);
  console.log("Is Joined:", isJoined);

  const handleJoin = async () => {
    if (!user) {
      toast.error('You must be logged in to join a community');
      return;
    }
    if (!community) return;

    try {
      await joinCommunity(community.community_id).unwrap();
      toast.success('Joined community successfully');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to join community');
    }
  };

  const handleLeave = async () => {
    if (!user) {
      toast.error('You must be logged in to leave a community');
      return;
    }
    if (!community) return;

    if (window.confirm(`Are you sure you want to leave j/${community.name}?`)) {
      try {
        await leaveCommunity(community.community_id).unwrap();
        toast.success('Left community successfully');
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to leave community');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">?</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Community not found</h2>
        <p>The community j/{communityName} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col md:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        {(community?.is_banned === 'Y' || community?.IS_BANNED === 'Y') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {/* <strong className="font-bold">Notice: </strong> */}
            <span className="block sm:inline">This community has been permanently banned</span>
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-sm shrink-0">
              j/
            </div>
            <div className="flex-1 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 leading-tight break-all">
                  j/{community.name}
                </h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  {community.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* <button 
                  onClick={() => navigate('/create', { state: { community: community.name, community_id: communityId } })}
                  className="px-4 py-2 border border-gray-300 rounded-full font-bold text-[14px] hover:bg-gray-50 transition-colors hidden sm:block">
                  Create Post
                </button> */}
                {(isJoined || user?.role !== 'admin') && (
                  <button
                    onClick={isJoined ? handleLeave : handleJoin}
                    disabled={isJoining || isLeaving}
                    className={`px-5 py-2 rounded-full font-bold text-[14px] flex items-center gap-2 transition-colors
                      ${isJoined
                        ? 'border border-red-200 text-red-600 hover:bg-red-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isJoining || isLeaving ? (
                      <div className={`w-4 h-4 border-2 ${isJoined ? 'border-red-600' : 'border-white'} border-t-transparent rounded-full animate-spin`}></div>
                    ) : isJoined ? (
                      <>
                        <Check className="w-4 h-4" />
                        Leave
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Join
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feed - Mocked for now */}
        <div className="space-y-2">
          <div className="bg-transparent py-2 flex items-center">
            <div className="relative flex-1 max-w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search in j/${community.name}`}
                className="w-full bg-gray-100 hover:bg-gray-200 transition-colors border border-transparent rounded-full pl-11 pr-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Posts */}
          <PostFeed communityId={community?.community_id} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-[316px] shrink-0">
        <div className="bg-[#EAEDF0] rounded-[16px] p-4 mb-4">
          <h2 className="font-bold text-[16px] text-gray-900 mb-3">About Community</h2>
          <p className="text-[14px] text-gray-700 mb-4 whitespace-pre-wrap">
            {community.description}
          </p>
          <div className="flex gap-4 border-t border-gray-200 pt-4 mb-4">
            <div>
              <div className="font-bold text-gray-900 text-lg">
                {membersCount}
              </div>
              <div className="text-[12px] text-gray-500">Members</div>
            </div>
          </div>
          {isJoined && (
            <button
              onClick={() => navigate('/create', { state: { community: community.name } })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-full py-2.5 transition-colors">
              Create Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
