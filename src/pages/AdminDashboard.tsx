import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { 
  useGetAllUsersQuery, 
  useGetAllCommunitiesAdminQuery, 
  useGetAllPostsAdminQuery,
  useToggleUserBanMutation,
  useToggleCommunityBanMutation,
  useDeletePostAdminMutation
} from '../redux/features/admin/adminApi';
import { toast } from 'sonner';

type TabType = 'USERS' | 'COMMUNITIES' | 'POSTS';

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('USERS');

  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery(undefined, { skip: activeTab !== 'USERS' });
  const { data: communitiesData, isLoading: isLoadingCommunities } = useGetAllCommunitiesAdminQuery(undefined, { skip: activeTab !== 'COMMUNITIES' });
  const { data: postsData, isLoading: isLoadingPosts } = useGetAllPostsAdminQuery(undefined, { skip: activeTab !== 'POSTS' });

  const [toggleUserBan] = useToggleUserBanMutation();
  const [toggleCommunityBan] = useToggleCommunityBanMutation();
  const [deletePostAdmin] = useDeletePostAdminMutation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleToggleUserBan = async (userId: number) => {
    try {
      await toggleUserBan(userId).unwrap();
      toast.success('User ban status updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user ban status');
    }
  };

  const handleToggleCommunityBan = async (communityId: number) => {
    try {
      await toggleCommunityBan(communityId).unwrap();
      toast.success('Community ban status updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update community ban status');
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

  const renderUsersTable = () => {
    if (isLoadingUsers) return <div className="text-center py-4">Loading users...</div>;
    const users = usersData?.data || [];

    return (
      <div className="overflow-x-auto">
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
              <tr key={u.user_id || u.USER_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{u.user_id || u.USER_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{u.username || u.USERNAME}</td>
                <td className="py-3 px-4 text-gray-600">{u.email || u.EMAIL}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    (u.role || u.ROLE) === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role || u.ROLE}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {(u.is_banned || u.IS_BANNED) === 'Y' ? (
                    <span className="text-red-600 font-semibold text-sm">Banned</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {(u.role || u.ROLE) !== 'admin' && (
                    <button
                      onClick={() => handleToggleUserBan(u.user_id || u.USER_ID)}
                      className={`text-sm font-medium px-3 py-1.5 rounded ${
                        (u.is_banned || u.IS_BANNED) === 'Y' 
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {(u.is_banned || u.IS_BANNED) === 'Y' ? 'Unban' : 'Ban'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCommunitiesTable = () => {
    if (isLoadingCommunities) return <div className="text-center py-4">Loading communities...</div>;
    const communities = communitiesData?.data || [];

    return (
      <div className="overflow-x-auto">
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
              <tr key={c.community_id || c.COMMUNITY_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{c.community_id || c.COMMUNITY_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{c.name || c.NAME}</td>
                <td className="py-3 px-4 text-gray-600">{c.category || c.CATEGORY}</td>
                <td className="py-3 px-4 text-gray-600">{c.creator_username || c.CREATOR_USERNAME}</td>
                <td className="py-3 px-4">
                  {(c.is_banned || c.IS_BANNED) === 'Y' ? (
                    <span className="text-red-600 font-semibold text-sm">Suspended</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleCommunityBan(c.community_id || c.COMMUNITY_ID)}
                    className={`text-sm font-medium px-3 py-1.5 rounded ${
                      (c.is_banned || c.IS_BANNED) === 'Y' 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {(c.is_banned || c.IS_BANNED) === 'Y' ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
            {communities.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No communities found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPostsTable = () => {
    if (isLoadingPosts) return <div className="text-center py-4">Loading posts...</div>;
    const posts = postsData?.data || [];

    return (
      <div className="overflow-x-auto">
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
              <tr key={p.post_id || p.POST_ID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{p.post_id || p.POST_ID}</td>
                <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-[200px]" title={p.title || p.TITLE}>
                  {p.title || p.TITLE}
                </td>
                <td className="py-3 px-4 text-gray-600">{p.post_type || p.POST_TYPE}</td>
                <td className="py-3 px-4 text-gray-600">{p.username || p.USERNAME}</td>
                <td className="py-3 px-4">
                  {(p.is_removed || p.IS_REMOVED) ? (
                    <span className="text-red-600 font-semibold text-sm">Deleted</span>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {!(p.is_removed || p.IS_REMOVED) && (
                    <button
                      onClick={() => handleDeletePost(p.post_id || p.POST_ID)}
                      className="text-sm font-medium px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No posts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-6 pb-12 flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Manage users, communities, and posts across the platform.</p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 w-full max-w-[500px]">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${activeTab === 'USERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('USERS')}
          >
            All Users
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${activeTab === 'COMMUNITIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('COMMUNITIES')}
          >
            All Communities
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-[15px] transition-colors border-b-2 ${activeTab === 'POSTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('POSTS')}
          >
            All Posts
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg">
          {activeTab === 'USERS' && renderUsersTable()}
          {activeTab === 'COMMUNITIES' && renderCommunitiesTable()}
          {activeTab === 'POSTS' && renderPostsTable()}
        </div>
      </div>
    </div>
  );
}
