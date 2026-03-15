import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/shell';
import { AuditPage } from '@/features/audit/audit-page';
import { AdminPage } from '@/features/auth/admin-page';
import { DashboardPage } from '@/features/auth/dashboard-page';
import { LoginPage } from '@/features/auth/login-page';
import { OperatorPage } from '@/features/auth/operator-page';
import { AdminCategoriesPage } from '@/features/catalog/admin-categories-page';
import { AdminSuppliersPage } from '@/features/catalog/admin-suppliers-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { RoleRoute } from '@/features/auth/components/role-route';
import { ProductDetailPage } from '@/features/products/product-detail-page';
import { ProductFormPage } from '@/features/products/product-form-page';
import { ProductsPage } from '@/features/products/products-page';
import { AdminUsersPage } from '@/features/users/admin-users-page';
import { ProfilePage } from '@/features/users/profile-page';

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
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'products',
            element: <ProductsPage />,
          },
          {
            path: 'products/:productId',
            element: <ProductDetailPage />,
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
                path: 'products/new',
                element: <ProductFormPage />,
              },
              {
                path: 'products/:productId/edit',
                element: <ProductFormPage />,
              },
              {
                path: 'admin',
                element: <AdminPage />,
              },
              {
                path: 'admin/users',
                element: <AdminUsersPage />,
              },
              {
                path: 'admin/categories',
                element: <AdminCategoriesPage />,
              },
              {
                path: 'admin/suppliers',
                element: <AdminSuppliersPage />,
              },
              {
                path: 'admin/audit',
                element: <AuditPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
