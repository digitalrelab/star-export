import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/Layout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const ExportPage = lazy(() => import('../pages/ExportPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
  </div>
);

// Layout wrapper component
const LayoutWrapper = () => (
  <Layout>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </Layout>
);

// Auth page wrapper (no layout)
const AuthWrapper = () => (
  <Suspense fallback={<PageLoader />}>
    <AuthPage />
  </Suspense>
);

// Route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWrapper />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'export/:platform',
        element: <ExportPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
    ],
  },
  {
    path: '/auth/:platform',
    element: <AuthWrapper />,
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-4">Page not found</p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go back home
          </a>
        </div>
      </div>
    ),
  },
]);

// Router component
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;