import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/site-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { LoginPage } from '@/features/auth/login-page';
import { HomePage } from '@/features/home/home-page';
import { CatalogPage } from '@/features/labs/catalog-page';
import { AdvancedFormLabPage } from '@/features/form-lab/advanced-form-lab-page';
import { AuthLabPage } from '@/features/auth/auth-lab-page';
import { ApiLabPage } from '@/features/api-lab/api-lab-page';
import { A11yLabPage } from '@/features/a11y-lab/a11y-lab-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'entrar',
        element: <LoginPage />,
      },
      {
        path: 'labs',
        children: [
          {
            index: true,
            element: <CatalogPage />,
          },
          {
            path: 'formulario-avancado',
            element: (
              <ProtectedRoute>
                <AdvancedFormLabPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'auth',
            element: <AuthLabPage />,
          },
          {
            path: 'api',
            element: <ApiLabPage />,
          },
          {
            path: 'acessibilidade',
            element: <A11yLabPage />,
          },
        ],
      },
    ],
  },
]);
