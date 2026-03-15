import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/shell';
import { AdminPage } from '@/features/auth/admin-page';
import { DashboardPage } from '@/features/auth/dashboard-page';
import { LoginPage } from '@/features/auth/login-page';
import { OperatorPage } from '@/features/auth/operator-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { RoleRoute } from '@/features/auth/components/role-route';
import { ProductDetailPage } from '@/features/products/product-detail-page';
import { ProductFormPage } from '@/features/products/product-form-page';
import { ProductsPage } from '@/features/products/products-page';
import { AdminUsersPage } from '@/features/users/admin-users-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'products',
            element: <ProductsPage />,
          },
          {
            path: 'products/new',
            element: <ProductFormPage />,
          },
          {
            path: 'products/:productId',
            element: <ProductDetailPage />,
          },
          {
            path: 'products/:productId/edit',
            element: <ProductFormPage />,
          },
          {
            element: <RoleRoute allow={['ADMIN', 'OPERATOR']} />,
            children: [
              {
                path: 'operator',
                element: <OperatorPage />,
              },
            ],
          },
          {
            element: <RoleRoute allow={['ADMIN']} />,
            children: [
              {
                path: 'admin',
                element: <AdminPage />,
              },
              {
                path: 'admin/users',
                element: <AdminUsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
