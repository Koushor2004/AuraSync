import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-surface-dark/70 border-b border-gray-100 dark:border-white/5">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <motion.span
            className="w-3 h-3 rounded-full bg-brand-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          AuraSync
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:opacity-80 transition"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <span className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300">
            {user.name?.split(' ')[0]}
          </span>
          <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-sm">
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile links */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
