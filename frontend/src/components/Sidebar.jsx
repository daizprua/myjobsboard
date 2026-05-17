import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Search, UserCircle, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Kanban Board', path: '/kanban', icon: KanbanSquare },
    { name: 'Job Explorer', path: '/explorer', icon: Search },
    { name: 'Profile & Settings', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 16px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>MyJobsBoard</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Developer Workspace</p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--color-accent)' : 'var(--text-main)',
                backgroundColor: isActive ? 'var(--color-accent-glow)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="btn btn-outline" 
        style={{ marginTop: 'auto', display: 'flex', gap: '8px', color: 'var(--text-muted)', borderColor: 'transparent' }}
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
