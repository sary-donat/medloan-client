import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const roleLabels = { Admin: 'מנהל', Member: 'חבר' };

export default function Layout() {
  const { auth, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <strong>גמ"ח ציוד רפואי</strong>
        <nav>
          <NavLink to="/" end>רשימת ציוד</NavLink>
          {auth && <NavLink to="/my-loans">ההשאלות שלי</NavLink>}
          {auth?.role === 'Admin' && <NavLink to="/admin">ניהול</NavLink>}
        </nav>
        <div className="user">
          {auth ? (
            <>
              {/* The role comes from AuthResponse and is for display only (11.12). */}
              <span>{auth.fullName} ({roleLabels[auth.role] ?? auth.role})</span>
              <button type="button" onClick={logout}>התנתקות</button>
            </>
          ) : (
            <>
              <NavLink to="/login">התחברות</NavLink>
              <NavLink to="/register">הרשמה</NavLink>
            </>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
