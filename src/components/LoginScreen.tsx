
interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { login, getLocation } from '../api/api';
import { setAuthToken } from '../auth';
import { useUser } from '../context/useUser';


export function LoginScreen({ onSwitchToRegister, onLoginSuccess }: LoginProps) {
  const { setUserId, setUsername, setSessionVotes, setLifetimeVotes, setOpinionCount, setOpinionIds, setLocation } = useUser();
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usernameInput || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { user, token } = await login(usernameInput, password);
      setAuthToken(token);
      setUserId(user.id);
      setUsername(user.username || null);
      setSessionVotes(user.sessionVotes || 0);
      setLifetimeVotes(user.lifetimeVotes || 0);
      setOpinionCount(user.opinionCount || 0);
      setOpinionIds(user.opinionIds || []);

      // Fetch location once per session
      try {
        const location = await getLocation();
        setLocation(location);
      } catch {
        setLocation(null);
      }

      onLoginSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">hot takes</h1>
            <p className="text-gray-600 mt-2">share your hottest opinions</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="your_username"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Switch to Register */}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
