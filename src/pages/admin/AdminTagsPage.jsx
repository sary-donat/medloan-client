import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, fieldErrors } from '../../api/client';
import FieldError from '../../components/FieldError';

export default function AdminTagsPage() {
  const [tags, setTags] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api
      .get('/api/tags')
      .then((r) => setTags(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await api.post('/api/tags', { name });
      setName('');
      await load();
    } catch (err) {
      // 409: a tag with this name already exists.
      setErrors(fieldErrors(err, ['name']));
    } finally {
      setBusy(false);
    }
  }

  async function remove(tag) {
    if (!window.confirm(`למחוק את התגית "${tag.name}"? היא תוסר מכל הפריטים.`)) return;
    setError('');
    setBusy(true);
    try {
      await api.delete(`/api/tags/${tag.id}`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>תגיות</h1>
      {error && <p className="error">{error}</p>}

      {tags === null ? (
        !error && <p>טוען...</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>שם</th><th></th></tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{tag.name}</td>
                <td>
                  <button type="button" onClick={() => remove(tag)} disabled={busy}>מחיקה</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form className="inline-form" onSubmit={add} noValidate>
        <h3>תגית חדשה</h3>
        {errors._form && <p className="error">{errors._form}</p>}
        <label>
          שם
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError errors={errors} name="name" />
        </label>
        <button type="submit" disabled={busy}>הוספה</button>
      </form>
    </section>
  );
}
