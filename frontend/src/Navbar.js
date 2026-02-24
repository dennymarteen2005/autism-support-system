import React from 'react';
import { useAuth } from './AuthContext';

function Navbar({ setViewMode }) {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="nav-left">
        🧩 Autism Support
      </div>

      <div className="nav-right">

        {user && (
          <>
            <button onClick={() => setViewMode('dashboard')}>Dashboard</button>
            <button onClick={() => setViewMode('progress')}>Progress</button>
            <button onClick={() => setViewMode('history')}>History</button>
          </>
        )}

        {!user && (
          <>
            <button onClick={() => setViewMode('login')}>Login</button>
            <button onClick={() => setViewMode('register')}>Register</button>
          </>
        )}

        {user && (
          <button onClick={() => {
            logout();
            setViewMode('login');
          }}>
            Logout
          </button>
        )}

      </div>
    </div>
  );
}

export default Navbar;