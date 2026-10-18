import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, fieldErrors } from '../../api/client';
import FieldError from '../../components/FieldError';

// Field names as in CreateCategoryRequest / UpdateCategoryRequest.
const EMPTY_FORM = { name: '', description: '' };
const FIELDS = Object.keys(EMPTY_FORM);

function toBody(form) {
  return { name: form.name, description: form.description || null };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [newErrors, setNewErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api
      .get('/api/categories')
      .then((r) => setCategories(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e) {
    e.preventDefault();
    setNewErrors({});
    setBusy(true);
    try {
      await api.post('/api/categories', toBody(newForm));
      setNewForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setNewErrors(fieldErrors(err, FIELDS));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(category) {
    setEditId(category.id);
    setEditForm({ name: category.name, description: category.description ?? '' });
    setEditErrors({});
  }

  async function saveEdit(e) {
    e.preventDefault();
    setEditErrors({});
    setBusy(true);
    try {
      await api.put(`/api/categories/${editId}`, toBody(editForm));
      setEditId(null);
      await load();
    } catch (err) {
      setEditErrors(fieldErrors(err, FIELDS));
    } finally {
      setBusy(false);
    }
  }

  async function remove(category) {
    if (!window.confirm(`למחוק את הקטגוריה "${category.name}"?`)) return;
    setError('');
    setBusy(true);
    try {
      await api.delete(`/api/categories/${category.id}`);
      await load();
    } catch (e) {
      // 409: the category still has items.
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>קטגוריות</h1>
      {error && <p className="error">{error}</p>}

      {categories === null ? (
        !error && <p>טוען...</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>שם</th><th>תיאור</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((category) =>
              category.id === editId ? (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <input
                      form="edit-category"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <FieldError errors={editErrors} name="name" />
                  </td>
                  <td>
                    <input
                      form="edit-category"
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    />
                    <FieldError errors={editErrors} name="description" />
                  </td>
                  <td className="actions">
                    {/* The form element sits in the cell; the inputs join it through their form attribute. */}
                    <form id="edit-category" onSubmit={saveEdit} noValidate>
                      <button type="submit" disabled={busy}>שמירה</button>
                    </form>
                    <button type="button" onClick={() => setEditId(null)}>ביטול</button>
                    {editErrors._form && <span className="field-error">{editErrors._form}</span>}
                  </td>
                </tr>
              ) : (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td className="actions">
                    <button type="button" onClick={() => startEdit(category)} disabled={busy}>עריכה</button>
                    <button type="button" onClick={() => remove(category)} disabled={busy}>מחיקה</button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}

      <form className="inline-form" onSubmit={add} noValidate>
        <h3>קטגוריה חדשה</h3>
        {newErrors._form && <p className="error">{newErrors._form}</p>}
        <label>
          שם
          <input value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
          <FieldError errors={newErrors} name="name" />
        </label>
        <label>
          תיאור
          <input
            value={newForm.description}
            onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
          />
          <FieldError errors={newErrors} name="description" />
        </label>
        <button type="submit" disabled={busy}>הוספה</button>
      </form>
    </section>
  );
}
