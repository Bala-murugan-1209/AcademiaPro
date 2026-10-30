import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  ShieldAlert, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-danger';
      case 'FACULTY': return 'badge-primary';
      case 'STUDENT': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      margin: '0.75rem 1.25rem 1.25rem',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          background: 'var(--grad-primary)',
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px var(--primary-glow)',
        }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Academia<span style={{ color: 'var(--primary)' }}>Pro</span>
            </h1>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              v2.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '-2px' }}>
            College Management System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--primary)" />}
        </button>

        {/* User Profile Info */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}>
              {user.name?.charAt(0) || <UserIcon size={18} />}
            </div>
            <div style={{ display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {user.name}
              </div>
              <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                {user.role}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="btn btn-secondary btn-icon"
              title="Sign Out"
              style={{ marginLeft: '0.25rem' }}
            >
              <LogOut size={16} color="var(--accent-rose)" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
