import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <>
      <nav className="admin-nav">
        <NavLink to="loans">השאלות</NavLink>
        <NavLink to="items">פריטים ועותקים</NavLink>
        <NavLink to="categories">קטגוריות</NavLink>
        <NavLink to="tags">תגיות</NavLink>
        <NavLink to="members">חברים</NavLink>
      </nav>
      <Outlet />
    </>
  );
}
