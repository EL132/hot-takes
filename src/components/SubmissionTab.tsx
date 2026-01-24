import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface SubmissionTabProps {
  onSubmit?: (opinion: string) => void;
}

export function SubmissionTab({ onSubmit }: SubmissionTabProps) {
  const [opinion, setOpinion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opinion.trim()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Log to console for now
      console.log('Opinion submitted:', opinion);

      // Call optional callback
      if (onSubmit) {
        onSubmit(opinion);
      }

      // Show success message
      setSubmitted(true);
      setOpinion('');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
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
                  className={`${
                    characterCount > maxCharacters * 0.9
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!opinion.trim() || loading}
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
