import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { submitOpinion, getCurrentUser, filterProfanity } from '../api/api';
import { useUser } from '../context/useUser';


interface SubmissionTabProps {
  onSubmit?: (opinion: string) => void;
}

export function SubmissionTab({ onSubmit }: SubmissionTabProps) {
  const { userId, location, setLifetimeVotes, setSessionVotes, setOpinionCount, setOpinionIds } = useUser();
  const [opinion, setOpinion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opinion.trim() || !userId || !location) return;

    setError('');
    setLoading(true);

    try {
      // Profanity filter
      const { censored, has_profanity } = await filterProfanity(opinion);
      if (has_profanity) {
        setError('Your opinion contains inappropriate language. Please revise and try again.');
        setLoading(false);
        return;
      }

      await submitOpinion(censored, userId, location.region || undefined);

      // Update user stats after submission
      try {
        const user = await getCurrentUser();
        setLifetimeVotes(user.lifetimeVotes || 0);
        setSessionVotes(user.sessionVotes || 0);
        setOpinionCount(user.opinionCount || 0);
        setOpinionIds(user.opinionIds || []);
      } catch {
        // ignore
      }

      // Call optional callback
      if (onSubmit) {
        onSubmit(censored);
      }

      // Show success message
      setSubmitted(true);
      setOpinion('');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit opinion';
      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const characterCount = opinion.length;
  const maxCharacters = 280;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col pb-24">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {submitted && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Opinion submitted!</p>
                <p className="text-sm text-green-700">
                  Thanks for sharing your take.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Opinion
              </label>
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                placeholder="What's your hottest take? Share something controversial, funny, or insightful..."
                maxLength={maxCharacters}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />

              {/* Character Count */}
              <div className="text-right text-sm mt-2">
                <span
                  className={`$
                    characterCount > maxCharacters * 0.9
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </div>

            {/* Location Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region (auto-detected)
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {location?.region || location?.country || 'Detecting region...'}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!opinion.trim() || !location || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {loading ? 'Submitting...' : 'Submit Opinion'}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">💡 Tips for great takes:</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Be bold and controversial</li>
              <li>✓ Keep it concise and punchy</li>
              <li>✓ Add humor or insight</li>
              <li>✓ Avoid personal attacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
