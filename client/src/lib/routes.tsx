import { createBrowserRouter } from 'react-router-dom';
import Login from '@/features/login';
import MailBody from '@/features/emails/components/mail-body';
import AuthLayout from '@/components/layouts/auth-layout';
import EmailsPage from '@/features/emails';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/emails',
        element: <EmailsPage />,
      },
      {
        path: '/email/:id',
        element: <MailBody />,
      },
    ],
  },
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);
