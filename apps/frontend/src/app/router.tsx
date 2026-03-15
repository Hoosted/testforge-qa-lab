import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/shell';
import { HealthPage } from '@/features/health/health-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HealthPage />,
      },
    ],
  },
]);
