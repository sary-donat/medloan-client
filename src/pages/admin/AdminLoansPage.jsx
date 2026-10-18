import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage, formatDate } from '../../api/client';
import { usePagedList } from '../../api/usePagedList';

export default function AdminLoansPage() {
  const [status, setStatus] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [busyLoanId, setBusyLoanId] = useState(null);
  const loans = usePagedList('/api/loans', {
    status: status || undefined,
    overdueOnly: overdueOnly || undefined,
    memberId: memberId || undefined,
  });

  async function returnLoan(loanId) {
    loans.setError('');
    setBusyLoanId(loanId);
    try {
      await api.patch(`/api/loans/${loanId}`, { returned: true });
      // Only this row is refreshed, so the pages already loaded stay as they are.
      const { data } = await api.get(`/api/loans/${loanId}`);
      loans.setItems((list) => list.map((l) => (l.id === data.id ? data : l)));
    } catch (e) {
      loans.setError(errorMessage(e));
    } finally {
      setBusyLoanId(null);
    }
  }

  // Fixed when the page opens, for the overdue color on "due" dates.
  const [now] = useState(() => Date.now());

  return (
    <section>
      <h1>השאלות</h1>
      <div className="filters">
        <label>
          סטטוס
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">הכול</option>
            <option value="Active">פעילה</option>
            <option value="Returned">הוחזרה</option>
          </select>
        </label>
        <label>
          מזהה חבר
          <input type="number" min="1" value={memberId} onChange={(e) => setMemberId(e.target.value)} dir="ltr" />
        </label>
        <label className="check">
          <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
          באיחור בלבד
        </label>
      </div>

      {loans.error && <p className="error">{loans.error}</p>}

      <table>
        <thead>
          <tr><th>#</th><th>חבר</th><th>פריט</th><th>עותק</th><th>הושאל</th><th>להחזיר עד</th><th>סטטוס</th><th></th></tr>
        </thead>
        <tbody>
          {loans.items.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.memberFullName} ({loan.memberId})</td>
              <td><Link to={`/items/${loan.itemId}`}>{loan.itemName}</Link></td>
              <td dir="ltr">{loan.serialNumber}</td>
              <td>{formatDate(loan.loanedAt)}</td>
              <td className={loan.status === 'Active' && new Date(loan.dueAt).getTime() < now ? 'unavailable' : undefined}>
                {formatDate(loan.dueAt)}
              </td>
              <td>{loan.status === 'Active' ? 'פעילה' : `הוחזרה ב-${formatDate(loan.returnedAt)}`}</td>
              <td>
                {loan.status === 'Active' && (
                  <button type="button" onClick={() => returnLoan(loan.id)} disabled={busyLoanId !== null}>
                    החזר
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loans.loading && loans.items.length === 0 && !loans.error && <p>לא נמצאו השאלות.</p>}
      {loans.loading && <p>טוען...</p>}
      {!loans.loading && loans.hasMore && <button type="button" onClick={loans.loadMore}>טען עוד</button>}
    </section>
  );
}
