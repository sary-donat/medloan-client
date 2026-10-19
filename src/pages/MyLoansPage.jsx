import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage, formatDate } from '../api/client';

// Read only: a member borrows by themselves, but only the gemach (Admin) confirms a return.
export default function MyLoansPage() {
  const [loans, setLoans] = useState(null);
  const [error, setError] = useState('');

  // Full list from the server, newest first, no paging.
  useEffect(() => {
    api
      .get('/api/members/me/loans')
      .then((r) => setLoans(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (loans === null) return error ? <p className="error">{error}</p> : <p>טוען...</p>;

  return (
    <section>
      <h1>ההשאלות שלי</h1>
      {error && <p className="error">{error}</p>}
      {loans.length === 0 ? (
        <p>אין השאלות עדיין. <Link to="/">לרשימת הציוד</Link></p>
      ) : (
        <table>
          <thead>
            <tr><th>פריט</th><th>עותק</th><th>הושאל</th><th>להחזיר עד</th><th>סטטוס</th><th></th></tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td><Link to={`/items/${loan.itemId}`}>{loan.itemName}</Link></td>
                <td dir="ltr">{loan.serialNumber}</td>
                <td>{formatDate(loan.loanedAt)}</td>
                <td>{formatDate(loan.dueAt)}</td>
                <td>{loan.status === 'Active' ? 'פעילה' : `הוחזרה ב-${formatDate(loan.returnedAt)}`}</td>
                <td>{loan.status === 'Active' && 'להחזרה יש להביא את הציוד לגמ"ח'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
