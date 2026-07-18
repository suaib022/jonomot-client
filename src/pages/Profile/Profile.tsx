import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '../../redux/features/user/userApi';
import { 
  useGetPostsByUsernameQuery, 
  useGetUpvotedPostsQuery, 
  useGetDownvotedPostsQuery, 
  useGetSavedPostsQuery 
} from '../../redux/features/post/postApi';
import { useGetCommentsByUsernameQuery } from '../../redux/features/comment/commentApi';
import { 
  useGetAllUsersQuery, 
  useGetAllCommunitiesAdminQuery, 
  useGetAllPostsAdminQuery,
  useToggleUserBanMutation,
  usePromoteUserMutation,
  useToggleCommunityBanMutation,
  useDeletePostAdminMutation
} from '../../redux/features/admin/adminApi';
import { useAppSelector } from '../../redux/hooks';
import { toast } from 'sonner';

import { PostCard } from '../../components/post/PostCard';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import ProfileCommentCard from '../../components/profile/ProfileCommentCard';

type UserTabType = 'POSTS' | 'COMMENTS' | 'SAVED' | 'UPVOTED' | 'DOWNVOTED';
type AdminTabType = 'ALL_USERS' | 'ALL_COMMUNITIES' | 'ALL_POSTS';
type TabType = UserTabType | AdminTabType;

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<TabType>('POSTS');

  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(userId || '');
  const profile = profileData?.data;

  // Determine if this is the admin viewing their own profile
  const isAdminProfile = loggedInUser?.role === 'admin' || profile?.role === 'admin';

  React.useEffect(() => {
    if (isAdminProfile && activeTab === 'POSTS') {
      setActiveTab('ALL_USERS');
    }
  }, [isAdminProfile, activeTab]);

  const username = profile?.out_username || '';
  const skipQueries = isAdminProfile || !username;
  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUsernameQuery(username, { skip: skipQueries });
  const { data: commentsData, isLoading: isCommentsLoading } = useGetCommentsByUsernameQuery(username, { skip: skipQueries });
  const { data: upvotedData, isLoading: isUpvotedLoading } = useGetUpvotedPostsQuery(username, { skip: skipQueries });
  const { data: downvotedData, isLoading: isDownvotedLoading } = useGetDownvotedPostsQuery(username, { skip: skipQueries });
  const { data: savedData, isLoading: isSavedLoading } = useGetSavedPostsQuery(username, { skip: skipQueries });

  // Admin queries (only fetched when admin viewing own profile)
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery(undefined, { skip: !isAdminProfile || activeTab !== 'ALL_USERS' });
  const { data: communitiesAdminData, isLoading: isLoadingCommunities } = useGetAllCommunitiesAdminQuery(undefined, { skip: !isAdminProfile || activeTab !== 'ALL_COMMUNITIES' });
  const { data: postsAdminData, isLoading: isLoadingPosts } = useGetAllPostsAdminQuery(undefined, { skip: !isAdminProfile || activeTab !== 'ALL_POSTS' });

  const [toggleUserBan] = useToggleUserBanMutation();
  const [promoteUser] = usePromoteUserMutation();
  const [toggleCommunityBan] = useToggleCommunityBanMutation();
  const [deletePostAdmin] = useDeletePostAdminMutation();

  if (!loggedInUser || loggedInUser.user_id !== Number(userId)) {
    return <Navigate to="/" replace />;
  }

  if (isProfileLoading) {
    return <div className="min-h-screen bg-white flex justify-center items-center text-gray-900">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-white flex justify-center items-center text-gray-900">User not found.</div>;
  }

  // Admin action handlers
  const handleToggleUserBan = async (userId: number, isBanned: string) => {
    const action = isBanned === 'Y' ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await toggleUserBan(userId).unwrap();
      toast.success(`User ${action}ned successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${action} user`);
    }
  };

  const handlePromoteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;
    
    try {
      await promoteUser(userId).unwrap();
      toast.success('User promoted to admin successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to promote user');
    }
  };

  const handleToggleCommunityBan = async (communityId: number, isBanned: string) => {
    const action = isBanned === 'Y' ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this community?`)) return;

    try {
      await toggleCommunityBan(communityId).unwrap();
      toast.success(`Community ${action}ed successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${action} community`);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePostAdmin(postId).unwrap();
      toast.success('Post deleted successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete post');
    }
  };

  // Admin tab renderers
  const renderUsersTable = () => {
    if (isLoadingUsers) return <div className="text-center py-4">Loading users...</div>;
    const users = usersData?.data || [];
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Username</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.USER_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{u.USER_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{u.USERNAME}</td>
                <td className="py-3 px-4 text-gray-600">{u.EMAIL}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    u.ROLE === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.ROLE}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {u.IS_BANNED === 'Y' ? (
                    <span className="text-red-600 font-semibold text-sm">Banned</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {u.ROLE !== 'admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleUserBan(u.USER_ID, u.IS_BANNED)}
                        className={`text-sm font-medium px-3 py-1.5 rounded ${
                          u.IS_BANNED === 'Y'
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {u.IS_BANNED === 'Y' ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => handlePromoteUser(u.USER_ID)}
                        className="text-sm font-medium px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Promote to Admin
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCommunitiesTable = () => {
    if (isLoadingCommunities) return <div className="text-center py-4">Loading communities...</div>;
    const communities = communitiesAdminData?.data || [];
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Creator</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {communities.map((c: any) => (
              <tr key={c.COMMUNITY_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{c.COMMUNITY_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{c.NAME}</td>
                <td className="py-3 px-4 text-gray-600">{c.CATEGORY}</td>
                <td className="py-3 px-4 text-gray-600">{c.CREATOR_USERNAME}</td>
                <td className="py-3 px-4">
                  {c.IS_BANNED === 'Y' ? (
                    <span className="text-red-600 font-semibold text-sm">Suspended</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleCommunityBan(c.COMMUNITY_ID, c.IS_BANNED)}
                    className={`text-sm font-medium px-3 py-1.5 rounded ${
                      c.IS_BANNED === 'Y'
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {c.IS_BANNED === 'Y' ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
            {communities.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">No communities found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPostsTable = () => {
    if (isLoadingPosts) return <div className="text-center py-4">Loading posts...</div>;
    const posts = postsAdminData?.data || [];
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Title</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Author</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p: any) => (
              <tr key={p.POST_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{p.POST_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-[200px]" title={p.TITLE}>
                  {p.TITLE}
                </td>
                <td className="py-3 px-4 text-gray-600">{p.POST_TYPE}</td>
                <td className="py-3 px-4 text-gray-600">{p.USERNAME}</td>
                <td className="py-3 px-4">
                  {p.IS_REMOVED ? (
                    <span className="text-red-600 font-semibold text-sm">Deleted</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {!p.IS_REMOVED && (
                    <button
                      onClick={() => handleDeletePost(p.POST_ID)}
                      className="text-sm font-medium px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">No posts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    // Admin tabs
    if (isAdminProfile) {
      switch (activeTab) {
        case 'ALL_USERS': return renderUsersTable();
        case 'ALL_COMMUNITIES': return renderCommunitiesTable();
        case 'ALL_POSTS': return renderPostsTable();
        default: return null;
      }
    }

    // Regular user tabs
    switch (activeTab) {
      case 'POSTS':
        if (isPostsLoading) return <div className="text-gray-900 text-center mt-8">Loading posts...</div>;
        if (!postsData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No posts yet</div>;
        return postsData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'COMMENTS':
        if (isCommentsLoading) return <div className="text-gray-900 text-center mt-8">Loading comments...</div>;
        if (!commentsData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No comments yet</div>;
        return commentsData.data.map(comment => <ProfileCommentCard key={comment.comment_id} comment={comment} username={username || ''} />);
      
      case 'SAVED':
        if (isSavedLoading) return <div className="text-gray-900 text-center mt-8">Loading saved posts...</div>;
        if (!savedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No saved posts</div>;
        return savedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'UPVOTED':
        if (isUpvotedLoading) return <div className="text-gray-900 text-center mt-8">Loading upvoted posts...</div>;
        if (!upvotedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No upvoted posts</div>;
        return upvotedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      case 'DOWNVOTED':
        if (isDownvotedLoading) return <div className="text-gray-900 text-center mt-8">Loading downvoted posts...</div>;
        if (!downvotedData?.data?.length) return <div className="text-gray-500 text-center mt-8 font-bold">No downvoted posts</div>;
        return downvotedData.data.map(post => <PostCard key={post.post_id} post={post} />);
      
      default:
        return null;
    }
  };

  // Tab definitions
  const adminTabs: { id: AdminTabType; label: string }[] = [
    { id: 'ALL_USERS', label: 'All Users' },
    { id: 'ALL_COMMUNITIES', label: 'All Communities' },
    { id: 'ALL_POSTS', label: 'All Posts' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col gap-6">
      {/* Full Width Content Area */}
      <div className="w-full">
        <ProfileHeader profile={profile} />

        {isAdminProfile ? (
          /* Admin Tabs */
          <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-xl px-2 pt-2 shadow-sm">
            {adminTabs.map((tab) => (
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
        ) : (
          <ProfileTabs activeTab={activeTab as UserTabType} setActiveTab={setActiveTab} />
        )}
        
        <div className="mt-4 space-y-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
