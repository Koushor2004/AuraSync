import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userApi, spotifyApi } from '../api/endpoints';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [connecting, setConnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleThemeChange = async (value) => {
    setTheme(value);
    try {
      await userApi.updateProfile({ theme: value });
      updateUser({ preferences: { ...user.preferences, theme: value } });
    } catch {
      toast.error('Could not save theme preference');
    }
  };

  const handleNotificationsToggle = async () => {
    const next = !notifications;
    setNotifications(next);
    try {
      await userApi.updateProfile({ notifications: next });
      updateUser({ preferences: { ...user.preferences, notifications: next } });
      toast.success(next ? 'Notifications enabled' : 'Notifications disabled');
    } catch {
      toast.error('Could not update notifications');
      setNotifications(!next);
    }
  };

  const handleConnectSpotify = async () => {
    setConnecting(true);
    try {
      const { data } = await spotifyApi.connect();
      window.location.href = data.url;
    } catch {
      toast.error('Could not start Spotify connection');
      setConnecting(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    try {
      await spotifyApi.disconnect();
      updateUser({ spotifyConnected: false });
      toast.success('Spotify disconnected');
    } catch {
      toast.error('Could not disconnect Spotify');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      toast.success('Account deleted');
      await logout();
      window.location.href = '/login';
    } catch {
      toast.error('Could not delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your account, appearance, and integrations.
        </p>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                : 'border-gray-200 dark:border-white/10'
            }`}
          >
            ☀️ Light Mode
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-gray-200 dark:border-white/10'
            }`}
          >
            🌙 Dark Mode
          </button>
        </div>
      </section>

      <section className="card p-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Notifications</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get reminders to check in with your mood
          </p>
        </div>
        <button
          onClick={handleNotificationsToggle}
          className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
            notifications ? 'bg-brand-600 justify-end' : 'bg-gray-300 dark:bg-white/10 justify-start'
          }`}
        >
          <motion.span layout className="w-5 h-5 rounded-full bg-white shadow" />
        </button>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-semibold">Spotify Connection</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Status:{' '}
            <span className={user?.spotifyConnected ? 'text-green-500' : 'text-gray-400'}>
              {user?.spotifyConnected ? 'Connected' : 'Not connected'}
            </span>
          </p>
          {user?.spotifyConnected ? (
            <button onClick={handleDisconnectSpotify} className="btn-secondary text-sm">
              Disconnect
            </button>
          ) : (
            <button onClick={handleConnectSpotify} disabled={connecting} className="btn-primary text-sm">
              {connecting ? 'Redirecting…' : 'Connect Spotify'}
            </button>
          )}
        </div>
      </section>

      <section className="card p-6 space-y-3 border-red-200 dark:border-red-500/20">
        <h2 className="font-semibold text-red-500">Danger Zone</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Deleting your account permanently removes your profile and emotion history.
        </p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleDeleteAccount} className="btn-primary !bg-red-600 hover:!bg-red-700 text-sm">
              Confirm Delete
            </button>
            <button onClick={() => setShowConfirm(false)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
