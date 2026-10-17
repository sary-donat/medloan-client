import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';

// The fields of RegisterRequest (11.7). There is no role: a new member is always a Member.
const empty = { fullName: '', email: '', phone: '', password: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);   // logged in right away
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h1>הרשמה</h1>
      <label>
        שם מלא
        <input value={form.fullName} onChange={update('fullName')} required maxLength={100} />
      </label>
      <label>
        אימייל
        <input type="email" value={form.email} onChange={update('email')} required maxLength={200} dir="ltr" />
      </label>
      <label>
        טלפון
        <input type="tel" value={form.phone} onChange={update('phone')} required maxLength={20} dir="ltr" />
      </label>
      <label>
        סיסמה (לפחות 8 תווים)
        <input type="password" value={form.password} onChange={update('password')} required minLength={8} maxLength={100} dir="ltr" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>הרשמה</button>
      <p>כבר רשום? <Link to="/login">להתחברות</Link></p>
    </form>
  );
}
