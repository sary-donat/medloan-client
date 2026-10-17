import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      // Wrong credentials stay on this screen with the server's message.
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h1>התחברות</h1>
      {location.state?.expired && <p className="info">ההתחברות פגה. נא להתחבר מחדש.</p>}
      <label>
        אימייל
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
      </label>
      <label>
        סיסמה
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>התחברות</button>
      <p>אין לך חשבון? <Link to="/register">להרשמה</Link></p>
    </form>
  );
}
