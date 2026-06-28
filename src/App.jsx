import { useAuth } from './hooks/useAuth';

export default function App() {
  const { session, profile, loading, isAdmin } = useAuth();

  return (
    <div style={{ color: 'white', padding: 40, fontSize: 18, fontFamily: 'monospace' }}>
      <p>loading: {String(loading)}</p>
      <p>session: {session ? 'existe' : 'null'}</p>
      <p>profile: {profile ? JSON.stringify(profile) : 'null'}</p>
      <p>isAdmin: {String(isAdmin)}</p>
    </div>
  );
}
