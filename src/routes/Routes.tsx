import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import CreatePost from '../pages/CreatePost';
import Community from '../pages/Community';
import PostDetail from '../pages/PostDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile/Profile';

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
        path: '/u/:username',
        element: <Profile />,
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
