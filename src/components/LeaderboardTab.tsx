import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getLeaderboard, type LeaderboardOpinion } from '../api/api';

export function LeaderboardTab() {
  const [opinions, setOpinions] = useState<LeaderboardOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortType, setSortType] = useState<'votes' | 'newest'>('votes');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch leaderboard from backend API
      const opinions = await getLeaderboard(10, 'top');
      setOpinions(opinions);
    } catch (err) {
      setError('Failed to load leaderboard. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const sortedOpinions = [...opinions].sort((a, b) => {
    if (sortType === 'votes') {
      return b.voteCount - a.voteCount;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col pb-24">
      {/* Sort Section */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h2>
        <div className="relative w-full max-w-xs">
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as 'votes' | 'newest')}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="votes">🔥 Top Votes</option>
            <option value="newest">🆕 Newest</option>
          </select>
          <ChevronDown
            size={20}
            className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4">Loading leaderboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
            {error}
            <button
              onClick={() => fetchLeaderboard()}
              className="block mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mx-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-4xl mx-auto space-y-3">
            {sortedOpinions.map((opinion, index) => (
              <div
                key={opinion.id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition border-l-4 border-blue-500"
              >
                {/* Rank Badge */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Opinion Content */}
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium leading-relaxed mb-2">
                      {opinion.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{opinion.createdAt}</span>
                      <span className="font-bold text-blue-600">
                        {opinion.voteCount} votes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
