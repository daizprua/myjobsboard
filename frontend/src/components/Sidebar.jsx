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
      <div className="sidebar-header">
        <h2 className="sidebar-logo">MyJobsBoard</h2>
        <p className="sidebar-subtitle">Developer Workspace</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} className="sidebar-icon" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="sidebar-logout" 
      >
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
