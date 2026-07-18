import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import CreatePost from '../pages/CreatePost';
import Community from '../pages/Community';
import PostDetail from '../pages/PostDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile/Profile';
import News from '../pages/News';
import Opportunities from '../pages/Opportunities';
import Search from '../pages/Search';
import AdminDashboard from '../pages/AdminDashboard';

import { PublicRoute } from './PublicRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/create',
        element: <CreatePost />,
      },
      {
        path: '/j/:communityName',
        element: <Community />,
      },
      {
        path: '/post/:postId',
        element: <PostDetail />,
      },
      {
        path: '/u/:userId',
        element: <Profile />,
      },
      {
        path: '/news',
        element: <News />,
      },
      {
        path: '/opportunities',
        element: <Opportunities />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/admin',
        element: <AdminDashboard />,
      }
    ]
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },
]);

export default router;
