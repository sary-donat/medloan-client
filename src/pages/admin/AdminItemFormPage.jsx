import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage, fieldErrors } from '../../api/client';
import FieldError from '../../components/FieldError';
import ItemCopiesSection from './ItemCopiesSection';

// Field names as in CreateItemRequest / UpdateItemRequest (camelCase in JSON).
const EMPTY_FORM = {
  name: '',
  description: '',
  manufacturer: '',
  maxLoanDays: '30',
  requiresDeposit: false,
  depositAmount: '',
  categoryId: '',
  tagIds: [],
};
const FIELDS = Object.keys(EMPTY_FORM);

function toForm(item) {
  return {
    name: item.name,
    description: item.description ?? '',
    manufacturer: item.manufacturer ?? '',
    maxLoanDays: String(item.maxLoanDays),
    requiresDeposit: item.requiresDeposit,
    depositAmount: item.depositAmount ?? '',
    categoryId: String(item.categoryId),
    tagIds: item.tags.map((t) => t.id),
  };
}

// PUT replaces the item, so every field is sent, including the current TagIds.
// Empty numbers become 0, so the server's Range check reports them next to the field.
function toBody(form) {
  return {
    name: form.name,
    description: form.description || null,
    manufacturer: form.manufacturer || null,
    maxLoanDays: Number(form.maxLoanDays),
    requiresDeposit: form.requiresDeposit,
    depositAmount: form.depositAmount === '' ? null : Number(form.depositAmount),
    categoryId: Number(form.categoryId),
    tagIds: form.tagIds,
  };
}

export default function AdminItemFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(isEdit ? null : EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(location.state?.created ? 'הפריט נוסף. אפשר להוסיף לו עותקים.' : '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/categories').then((r) => setCategories(r.data)).catch((e) => setLoadError(errorMessage(e)));
    api.get('/api/tags').then((r) => setTags(r.data)).catch((e) => setLoadError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/api/items/${id}`)
      .then((r) => setForm(toForm(r.data)))
      .catch((e) => setLoadError(errorMessage(e)));
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  function toggleTag(tagId) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId) ? f.tagIds.filter((t) => t !== tagId) : [...f.tagIds, tagId],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/api/items/${id}`, toBody(form));
        setSuccess('השינויים נשמרו.');
      } else {
        const { data } = await api.post('/api/items', toBody(form));
        navigate(`/admin/items/${data.id}`, { replace: true, state: { created: true } });
      }
    } catch (err) {
      setErrors(fieldErrors(err, FIELDS));
    } finally {
      setBusy(false);
    }
  }

  if (!form) return loadError ? <p className="error">{loadError}</p> : <p>טוען...</p>;

  return (
    <section>
      <Link to="/admin/items">→ חזרה לפריטים</Link>
      {/* noValidate: the server's validation is shown, not the browser's. */}
      <form className="card form wide" onSubmit={handleSubmit} noValidate>
        <h1>{isEdit ? `עריכת פריט #${id}` : 'פריט חדש'}</h1>
        {loadError && <p className="error">{loadError}</p>}
        {errors._form && <p className="error">{errors._form}</p>}
        {success && <p className="success">{success}</p>}

        <label>
          שם
          <input value={form.name} onChange={update('name')} />
          <FieldError errors={errors} name="name" />
        </label>
        <label>
          תיאור
          <textarea value={form.description} onChange={update('description')} rows={3} />
          <FieldError errors={errors} name="description" />
        </label>
        <label>
          יצרן
          <input value={form.manufacturer} onChange={update('manufacturer')} />
          <FieldError errors={errors} name="manufacturer" />
        </label>
        <label>
          קטגוריה
          <select value={form.categoryId} onChange={update('categoryId')}>
            <option value="">בחירה...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <FieldError errors={errors} name="categoryId" />
        </label>
        <label>
          ימי השאלה מקסימליים
          <input type="number" value={form.maxLoanDays} onChange={update('maxLoanDays')} dir="ltr" />
          <FieldError errors={errors} name="maxLoanDays" />
        </label>
        <label className="check">
          <input type="checkbox" checked={form.requiresDeposit} onChange={update('requiresDeposit')} />
          נדרש פיקדון
        </label>
        <FieldError errors={errors} name="requiresDeposit" />
        <label>
          סכום פיקדון (ש"ח)
          <input type="number" step="0.01" value={form.depositAmount} onChange={update('depositAmount')} dir="ltr" />
          <FieldError errors={errors} name="depositAmount" />
        </label>
        <fieldset className="checks">
          <legend>תגיות</legend>
          {tags.map((t) => (
            <label key={t.id} className="check">
              <input type="checkbox" checked={form.tagIds.includes(t.id)} onChange={() => toggleTag(t.id)} />
              {t.name}
            </label>
          ))}
          <FieldError errors={errors} name="tagIds" />
        </fieldset>

        <button type="submit" disabled={busy}>{isEdit ? 'שמירה' : 'הוספה'}</button>
      </form>

      {isEdit && <ItemCopiesSection itemId={id} />}
    </section>
  );
}
