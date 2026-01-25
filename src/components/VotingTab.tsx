import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';
import { voteOnOpinion, getOpinion, type Opinion } from '../api/api';
import { useUser } from '../context/useUser';

/** Format ISO date to "Today @ 7:12pm", "Yesterday @ 3:12pm", or "1/22/26 @ 5:16pm" */
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const timeString = date.toLocaleTimeString(undefined, options);

  if (isToday) return `Today @ ${timeString}`;
  if (isYesterday) return `Yesterday @ ${timeString}`;

  // Fallback to short date for older dates
  const dateString = date.toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });

  return `${dateString} @ ${timeString}`;
};

export function VotingTab(): React.ReactElement {
  const { addInteraction, interactions } = useUser();
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const SWIPE_THRESHOLD = 100;

  const fetchNewOpinion = async () => {
    try {
      setLoading(true);
      setError('');
      const newOpinion = await getOpinion();
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

    // Animate card off screen
    setIsAnimatingOut(true);

    // Record interaction in context
    addInteraction({
      opinionId: opinion.id,
      voteType,
      timestamp: new Date().toISOString(),
    });

    // Submit vote to backend API if not skipping
    if (voteType !== 'skip') {
      try {
        const voteValue = voteType === 'upvote' ? 1 : -1;
        await voteOnOpinion(opinion.id, voteValue as 1 | -1);
      } catch (err) {
        console.error('Failed to submit vote:', err);
      }
    }

    // Wait for animation to complete before fetching next opinion
    setTimeout(() => {
      setIsAnimatingOut(false);
      setSwipeDelta(0);
      fetchNewOpinion();
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    const delta = currentX - touchStart;
    setSwipeDelta(delta);
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
    } else {
      // Swipe didn't exceed threshold, snap back
      setSwipeDelta(0);
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
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Opinion Card */}
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 min-h-96 flex flex-col justify-center items-center text-center mb-8 cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: isAnimatingOut
                  ? `translateX(${swipeDelta > 0 ? 500 : -500}px) rotateZ(${swipeDelta > 0 ? 20 : -20}deg) opacity(0)`
                  : `translateX(${swipeDelta}px) rotateZ(${swipeDelta * 0.1}deg)`,
                transition: isAnimatingOut ? 'all 0.3s ease-out' : 'none',
                transformOrigin: 'center',
              }}
            >
              <p className="text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
                {opinion.content}
              </p>
              <p className="text-sm text-gray-500">
                Created: {formatDate(opinion.dateSubmitted)}
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
