import { useState } from 'react';
import { api, errorMessage, formatDate } from '../../api/client';
import { usePagedList } from '../../api/usePagedList';
import { useAuth } from '../../auth/AuthContext';

const roleLabels = { Admin: 'מנהל', Member: 'חבר' };

export default function AdminMembersPage() {
  const { auth } = useAuth();
  const members = usePagedList('/api/members', {});
  const [busyMemberId, setBusyMemberId] = useState(null);

  // PATCH with only the field that changes; then the row is read again from the server.
  async function patchMember(member, changes) {
    members.setError('');
    setBusyMemberId(member.id);
    try {
      await api.patch(`/api/members/${member.id}`, changes);
      const { data } = await api.get(`/api/members/${member.id}`);
      members.setItems((list) => list.map((m) => (m.id === data.id ? data : m)));
    } catch (e) {
      members.setError(errorMessage(e));
    } finally {
      setBusyMemberId(null);
    }
  }

  return (
    <section>
      <h1>חברים</h1>
      {members.error && <p className="error">{members.error}</p>}

      <table>
        <thead>
          <tr><th>#</th><th>שם</th><th>אימייל</th><th>טלפון</th><th>הצטרף</th><th>תפקיד</th><th>סטטוס</th><th></th></tr>
        </thead>
        <tbody>
          {members.items.map((member) => {
            // The server returns 400 for the admin's own row; the buttons are disabled to avoid it.
            const isSelf = member.id === auth.memberId;
            const disabled = isSelf || busyMemberId !== null;
            return (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.fullName}{isSelf && ' (את/ה)'}</td>
                <td dir="ltr">{member.email}</td>
                <td dir="ltr">{member.phone}</td>
                <td>{formatDate(member.createdAt)}</td>
                <td>{roleLabels[member.role] ?? member.role}</td>
                <td className={member.isActive ? undefined : 'unavailable'}>{member.isActive ? 'פעיל' : 'חסום'}</td>
                <td className="actions">
                  <button type="button" disabled={disabled} onClick={() => patchMember(member, { isActive: !member.isActive })}>
                    {member.isActive ? 'חסימה' : 'שחרור'}
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => patchMember(member, { role: member.role === 'Admin' ? 'Member' : 'Admin' })}
                  >
                    {member.role === 'Admin' ? 'הפוך לחבר' : 'הפוך למנהל'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {members.loading && <p>טוען...</p>}
      {!members.loading && members.hasMore && <button type="button" onClick={members.loadMore}>טען עוד</button>}
    </section>
  );
}
