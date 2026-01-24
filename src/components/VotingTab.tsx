import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';

interface Opinion {
  id: string;
  content: string;
  createdAt: string;
}

interface VoteInteraction {
  opinionId: string;
  voteType: 'upvote' | 'downvote' | 'skip';
  timestamp: string;
}

interface VotingTabProps {
  onLogout: () => void;
}

export function VotingTab({ onLogout }: VotingTabProps) {
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactions, setInteractions] = useState<VoteInteraction[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const SWIPE_THRESHOLD = 100;

  const fetchNewOpinion = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      if (!response.ok) throw new Error('Failed to fetch opinion');

      const data = await response.json();
      const newOpinion: Opinion = {
        id: data.id,
        content: data.value,
        createdAt: new Date().toLocaleString(),
      };
      setOpinion(newOpinion);
    } catch (err) {
      setError('Failed to load opinion. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewOpinion();
  }, []);

  const handleVote = async (voteType: 'upvote' | 'downvote' | 'skip') => {
    if (!opinion) return;

    // Record interaction in state for future API integration
    const interaction: VoteInteraction = {
      opinionId: opinion.id,
      voteType,
      timestamp: new Date().toISOString(),
    };
    setInteractions((prev) => [...prev, interaction]);

    // TODO: Submit vote to backend API
    // POST /api/votes with { opinionId, userId, value: voteType === 'upvote' ? 1 : -1 }

    // Fetch next opinion
    await fetchNewOpinion();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SWIPE_THRESHOLD;

    if (isRightSwipe) {
      handleVote('upvote');
    } else if (isLeftSwipe) {
      handleVote('downvote');
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col pb-32">


      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4">Loading opinion...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
            {error}
            <button
              onClick={() => fetchNewOpinion()}
              className="block mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mx-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {opinion && !loading && (
          <div
            className="w-full max-w-2xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Opinion Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 min-h-96 flex flex-col justify-center items-center text-center mb-8 cursor-grab active:cursor-grabbing select-none">
              <p className="text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
                {opinion.content}
              </p>
              <p className="text-sm text-gray-500">
                Retrieved: {opinion.createdAt}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-6">
              {/* Downvote Button (Left) */}
              <button
                onClick={() => handleVote('downvote')}
                className="flex flex-col items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition transform hover:scale-105 active:scale-95"
              >
                <ThumbsDown size={28} />
                <span className="font-semibold">Disagree</span>
              </button>

              {/* Skip Button */}
              <button
                onClick={() => handleVote('skip')}
                className="flex flex-col items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition transform hover:scale-105 active:scale-95"
              >
                <SkipForward size={28} />
                <span className="font-semibold">Skip</span>
              </button>

              {/* Upvote Button (Right) */}
              <button
                onClick={() => handleVote('upvote')}
                className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition transform hover:scale-105 active:scale-95"
              >
                <ThumbsUp size={28} />
                <span className="font-semibold">Agree</span>
              </button>
            </div>

            {/* Swipe Instructions */}
            <div className="text-center mb-6 text-gray-600 text-sm">
              <p>💡 Swipe left to disagree, right to agree, or use buttons below</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer - Above Tab Bar */}
      <div className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600 mb-0">
        <p className="font-semibold mb-2">Your Interactions</p>
        <div className="flex justify-center gap-6">
          <span className="text-green-600">
            ✓ Agree: {interactions.filter((i) => i.voteType === 'upvote').length}
          </span>
          <span className="text-red-600">
            ✕ Disagree:{' '}
            {interactions.filter((i) => i.voteType === 'downvote').length}
          </span>
          <span className="text-gray-500">
            ⊘ Skip: {interactions.filter((i) => i.voteType === 'skip').length}
          </span>
        </div>
      </div>
    </div>
  );
}
