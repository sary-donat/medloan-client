import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage, formatDate } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { copyStatusLabel } from '../copyStatus';

const CONFLICT_BANNER = 'העותק נתפס על ידי משתמש אחר. נא לרענן ולנסות שוב.';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState('');
  const [success, setSuccess] = useState('');
  const [busyCopyId, setBusyCopyId] = useState(null);

  const load = useCallback(() => {
    return api
      .get(`/api/items/${id}`)
      .then((r) => setItem(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function borrow(copyId) {
    if (!auth) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setError('');
    setConflict('');
    setSuccess('');
    setBusyCopyId(copyId);
    try {
      const { data } = await api.post('/api/loans', { itemCopyId: copyId });
      setSuccess(`העותק ${data.serialNumber} הושאל בהצלחה. יש להחזיר עד ${formatDate(data.dueAt)}.`);
    } catch (e) {
      // 409: another member took the copy (availability check or Version, 3.2).
      if (e.response?.status === 409) setConflict(errorMessage(e));
      else setError(errorMessage(e));
    } finally {
      setBusyCopyId(null);
      await load();   // the copy status changes either way
    }
  }

  if (!item) return error ? <p className="error">{error}</p> : <p>טוען...</p>;

  return (
    <section>
      <Link to="/">→ חזרה לרשימה</Link>
      <h1>{item.name}</h1>
      <p className="muted">
        {item.categoryName}
        {item.manufacturer && ` · ${item.manufacturer}`}
        {item.tags.length > 0 && ` · ${item.tags.map((t) => t.name).join(', ')}`}
      </p>
      {item.description && <p>{item.description}</p>}
      <p>
        תקופת השאלה: עד {item.maxLoanDays} ימים
        {item.requiresDeposit && ` · נדרש פיקדון${item.depositAmount != null ? ` של ${item.depositAmount} ש"ח` : ''}`}
      </p>

      {conflict && (
        <div className="banner" role="alert">
          <strong>{CONFLICT_BANNER}</strong>
          <div>{conflict}</div>
          <button type="button" onClick={() => { setConflict(''); load(); }}>רענון</button>
        </div>
      )}
      {success && <p className="success">{success} <Link to="/my-loans">להשאלות שלי</Link></p>}
      {error && <p className="error">{error}</p>}

      <h2>עותקים ({item.availableCopies} זמינים)</h2>
      <table>
        <thead>
          <tr><th>מספר סידורי</th><th>מצב</th><th>סטטוס</th><th></th></tr>
        </thead>
        <tbody>
          {item.copies.map((copy) => (
            <tr key={copy.id}>
              <td dir="ltr">{copy.serialNumber}</td>
              <td>{copy.condition}</td>
              <td>{copyStatusLabel(copy.status)}</td>
              <td>
                {copy.status === 'Available' && (
                  <button type="button" onClick={() => borrow(copy.id)} disabled={busyCopyId !== null}>
                    השאל
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
