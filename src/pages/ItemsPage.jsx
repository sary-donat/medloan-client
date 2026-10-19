import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import ItemImage from '../components/ItemImage';

export default function ItemsPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [tagId, setTagId] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/categories').then((r) => setCategories(r.data)).catch((e) => setError(errorMessage(e)));
    api.get('/api/tags').then((r) => setTags(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);

  // The server pages by 10 (PagedResult); page 1 replaces the list, later pages are appended.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/items', { params: { page, categoryId: categoryId || undefined, tagId: tagId || undefined } })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setTotalPages(data.totalPages);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, categoryId, tagId]);

  // Loading state is set here, by the event, and not inside the effect.
  function goToPage(next) {
    setLoading(true);
    setError('');
    setPage(next);
  }

  const changeFilter = (setter) => (e) => {
    setter(e.target.value);
    goToPage(1);
  };

  return (
    <section>
      <h1>רשימת ציוד</h1>
      <div className="filters">
        <label>
          קטגוריה
          <select value={categoryId} onChange={changeFilter(setCategoryId)}>
            <option value="">הכול</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          תגית
          <select value={tagId} onChange={changeFilter(setTagId)}>
            <option value="">הכול</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <ul className="items">
        {items.map((item) => (
          <li key={item.id} className="card item-card">
            <Link to={`/items/${item.id}`}>
              <ItemImage itemId={item.id} name={item.name} />
              <strong>{item.name}</strong>
            </Link>
            <div className="muted">{item.categoryName}{item.manufacturer && ` · ${item.manufacturer}`}</div>
            <div className={`pill ${item.availableCopies > 0 ? 'available' : 'unavailable'}`}>
              {item.availableCopies} זמינים
            </div>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && !error && <p>לא נמצא ציוד.</p>}
      {loading && <p>טוען...</p>}
      {!loading && page < totalPages && (
        <button type="button" onClick={() => goToPage(page + 1)}>טען עוד</button>
      )}
    </section>
  );
}
