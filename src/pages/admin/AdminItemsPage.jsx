import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { usePagedList } from '../../api/usePagedList';

export default function AdminItemsPage() {
  const items = usePagedList('/api/items', {});
  const [busyItemId, setBusyItemId] = useState(null);

  async function deleteItem(item) {
    if (!window.confirm(`למחוק את "${item.name}" ואת כל העותקים שלו?`)) return;
    items.setError('');
    setBusyItemId(item.id);
    try {
      await api.delete(`/api/items/${item.id}`);
      items.setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (e) {
      // 409: the item has loan history.
      items.setError(errorMessage(e));
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <section>
      <h1>פריטים ועותקים</h1>
      <p><Link to="new">+ פריט חדש</Link></p>

      {items.error && <p className="error">{items.error}</p>}

      <table>
        <thead>
          <tr><th>#</th><th>שם</th><th>קטגוריה</th><th>זמינים</th><th></th></tr>
        </thead>
        <tbody>
          {items.items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td><Link to={`${item.id}`}>{item.name}</Link></td>
              <td>{item.categoryName}</td>
              <td>{item.availableCopies}</td>
              <td className="actions">
                <Link to={`${item.id}`}>עריכה ועותקים</Link>
                <button type="button" onClick={() => deleteItem(item)} disabled={busyItemId !== null}>מחיקה</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!items.loading && items.items.length === 0 && !items.error && <p>אין פריטים.</p>}
      {items.loading && <p>טוען...</p>}
      {!items.loading && items.hasMore && <button type="button" onClick={items.loadMore}>טען עוד</button>}
    </section>
  );
}
