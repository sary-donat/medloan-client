import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Layout from './components/Layout';
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminItemFormPage from './pages/admin/AdminItemFormPage';
import AdminItemsPage from './pages/admin/AdminItemsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLoansPage from './pages/admin/AdminLoansPage';
import AdminMembersPage from './pages/admin/AdminMembersPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ItemsPage from './pages/ItemsPage';
import LoginPage from './pages/LoginPage';
import MyLoansPage from './pages/MyLoansPage';
import RegisterPage from './pages/RegisterPage';

// The catalog is public, as on the server. Borrowing and "my loans" need a login; /admin needs the Admin role.
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-loans" element={<RequireAuth><MyLoansPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<Navigate to="loans" replace />} />
            <Route path="loans" element={<AdminLoansPage />} />
            <Route path="items" element={<AdminItemsPage />} />
            <Route path="items/new" element={<AdminItemFormPage />} />
            <Route path="items/:id" element={<AdminItemFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tags" element={<AdminTagsPage />} />
            <Route path="members" element={<AdminMembersPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
