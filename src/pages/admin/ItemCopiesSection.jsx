import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, fieldErrors } from '../../api/client';
import FieldError from '../../components/FieldError';
import { copyConditionLabel, copyConditions, copyStatusLabel, copyStatuses } from '../../copyStatus';

// Field names as in CreateCopyRequest.
const NEW_COPY = { serialNumber: '', condition: 'Good', notes: '' };
const NEW_COPY_FIELDS = Object.keys(NEW_COPY);

function rowValues(copy) {
  return { status: copy.status, condition: copy.condition, notes: copy.notes ?? '' };
}

export default function ItemCopiesSection({ itemId }) {
  const [copies, setCopies] = useState(null);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState('');
  const [busyCopyId, setBusyCopyId] = useState(null);
  const [newCopy, setNewCopy] = useState(NEW_COPY);
  const [addErrors, setAddErrors] = useState({});
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    return api
      .get(`/api/items/${itemId}/copies`)
      .then((r) => setCopies(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  function editRow(copy, field, value) {
    setEdits((prev) => ({ ...prev, [copy.id]: { ...rowValues(copy), ...prev[copy.id], [field]: value } }));
  }

  // PATCH: only the fields that differ from what the server returned.
  function changes(copy) {
    const original = rowValues(copy);
    const row = edits[copy.id] ?? original;
    return Object.fromEntries(Object.entries(row).filter(([field, value]) => value !== original[field]));
  }

  async function saveRow(copy) {
    setError('');
    setBusyCopyId(copy.id);
    try {
      await api.patch(`/api/copies/${copy.id}`, changes(copy));
    } catch (e) {
      // 409: a loaned copy's status cannot change. The row goes back to the server's values below.
      setError(`${copy.serialNumber}: ${errorMessage(e)}`);
    } finally {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[copy.id];
        return next;
      });
      setBusyCopyId(null);
      await load();
    }
  }

  async function addCopy(e) {
    e.preventDefault();
    setAddErrors({});
    setAdding(true);
    try {
      await api.post(`/api/items/${itemId}/copies`, { ...newCopy, notes: newCopy.notes || null });
      setNewCopy(NEW_COPY);
      await load();
    } catch (err) {
      setAddErrors(fieldErrors(err, NEW_COPY_FIELDS));
    } finally {
      setAdding(false);
    }
  }

  const updateNew = (field) => (e) => setNewCopy((c) => ({ ...c, [field]: e.target.value }));

  return (
    <section>
      <h2>עותקים</h2>
      {error && <p className="error">{error}</p>}

      {copies === null ? (
        !error && <p>טוען...</p>
      ) : (
        <table>
          <thead>
            <tr><th>מספר סידורי</th><th>סטטוס</th><th>מצב</th><th>הערות</th><th></th></tr>
          </thead>
          <tbody>
            {copies.map((copy) => {
              const row = edits[copy.id] ?? rowValues(copy);
              return (
                <tr key={copy.id}>
                  <td dir="ltr">{copy.serialNumber}</td>
                  <td>
                    <select value={row.status} onChange={(e) => editRow(copy, 'status', e.target.value)}>
                      {copyStatuses.map((s) => <option key={s} value={s}>{copyStatusLabel(s)}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={row.condition} onChange={(e) => editRow(copy, 'condition', e.target.value)}>
                      {copyConditions.map((c) => <option key={c} value={c}>{copyConditionLabel(c)}</option>)}
                    </select>
                  </td>
                  <td>
                    <input value={row.notes} onChange={(e) => editRow(copy, 'notes', e.target.value)} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => saveRow(copy)}
                      disabled={busyCopyId !== null || Object.keys(changes(copy)).length === 0}
                    >
                      שמירה
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <form className="inline-form" onSubmit={addCopy} noValidate>
        <h3>עותק חדש</h3>
        {addErrors._form && <p className="error">{addErrors._form}</p>}
        <label>
          מספר סידורי
          <input value={newCopy.serialNumber} onChange={updateNew('serialNumber')} dir="ltr" />
          <FieldError errors={addErrors} name="serialNumber" />
        </label>
        <label>
          מצב
          <select value={newCopy.condition} onChange={updateNew('condition')}>
            {copyConditions.map((c) => <option key={c} value={c}>{copyConditionLabel(c)}</option>)}
          </select>
          <FieldError errors={addErrors} name="condition" />
        </label>
        <label>
          הערות
          <input value={newCopy.notes} onChange={updateNew('notes')} />
          <FieldError errors={addErrors} name="notes" />
        </label>
        <button type="submit" disabled={adding}>הוספת עותק</button>
      </form>
    </section>
  );
}
