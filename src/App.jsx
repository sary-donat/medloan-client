import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ItemsPage from './pages/ItemsPage';
import LoginPage from './pages/LoginPage';
import MyLoansPage from './pages/MyLoansPage';
import RegisterPage from './pages/RegisterPage';

// The catalog is public, as on the server. Borrowing and "my loans" need a login.
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
        </Route>
      </Routes>
    </AuthProvider>
  );
}
