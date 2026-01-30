import { useState, useEffect, useCallback, useRef } from 'react';
import { ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';
import { voteOnOpinion, getOpinion, getCurrentUser, type Opinion } from '../api/api';
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
  const { updateOrAddInteraction, interactions, userId, setLifetimeVotes, setSessionVotes, setOpinionCount, setOpinionIds } = useUser();
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const touchStartRef = useRef<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [exitVoteType, setExitVoteType] = useState<'upvote' | 'downvote' | 'skip' | null>(null);
  const SWIPE_THRESHOLD = 100;

  const fetchNewOpinion = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const newOpinion = await getOpinion([], userId || undefined);
      setOpinion(newOpinion);
    } catch (err) {
      setError('Failed to load opinion. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNewOpinion();
  }, [fetchNewOpinion]);

  // Keyboard shortcuts: ← disagree, → agree, S skip (only when a card is visible and not animating)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!opinion || loading || isAnimatingOut) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleVote('downvote');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleVote('upvote');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVote('skip');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opinion, loading, isAnimatingOut]);

  const handleVote = async (voteType: 'upvote' | 'downvote' | 'skip') => {
    if (!opinion || !userId) return;

    // Animate card off screen in direction based on vote type
    setExitVoteType(voteType);
    setIsAnimatingOut(true);

    // Record interaction in context (or update if they already voted on this opinion)
    updateOrAddInteraction({
      opinionId: opinion.id,
      voteType,
      timestamp: new Date().toISOString(),
    });

    // Submit vote to backend API if not skipping
    if (voteType !== 'skip') {
      try {
        const voteValue = voteType === 'upvote' ? 1 : -1;
        await voteOnOpinion(opinion.id, voteValue as 1 | -1, userId);
        // Update user stats after voting
        try {
          const user = await getCurrentUser();
          setLifetimeVotes(user.lifetimeVotes || 0);
          setSessionVotes(user.sessionVotes || 0);
          setOpinionCount(user.opinionCount || 0);
          setOpinionIds(user.opinionIds || []);
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Failed to submit vote:', err);
      }
    }

    // Wait for animation to complete before fetching next opinion
    setTimeout(() => {
      setIsAnimatingOut(false);
      setExitVoteType(null);
      setSwipeDelta(0);
      fetchNewOpinion();
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    setSwipeDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const startX = touchStartRef.current;
    if (startX === null) return;
    const currentX = e.targetTouches[0].clientX;
    setSwipeDelta(currentX - startX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const startX = touchStartRef.current;
    handleSwipe(startX, endX);
  };

  const handleSwipe = (startX: number | null, endX: number) => {
    if (startX === null) return;

    const distance = startX - endX;
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

    touchStartRef.current = null;
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
            className="w-full max-w-2xl touch-none"
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Opinion Card */}
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 min-h-96 flex flex-col justify-center items-center text-center mb-8 cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: (() => {
                  if (!isAnimatingOut) {
                    return `translateX(${swipeDelta}px) rotateZ(${swipeDelta * 0.1}deg)`;
                  }
                  if (exitVoteType === 'downvote') {
                    return 'translateX(-500px) rotateZ(-20deg)';
                  }
                  if (exitVoteType === 'upvote') {
                    return 'translateX(500px) rotateZ(20deg)';
                  }
                  if (exitVoteType === 'skip') {
                    return 'translateY(-120px) scale(0.96)';
                  }
                  return `translateX(${swipeDelta}px) rotateZ(${swipeDelta * 0.1}deg)`;
                })(),
                opacity: isAnimatingOut ? 0 : 1,
                transition: isAnimatingOut ? 'all 0.3s ease-out' : 'none',
                transformOrigin: 'center',
              }}
            >
              <p className="text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
                {opinion.content}
              </p>
              {/* Location display */}
              {opinion.location && (
                <p className="text-sm text-blue-600 font-medium mb-1">
                  {`📍 ${opinion.location}`}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Created: {formatDate(opinion.dateSubmitted)}
              </p>
              {opinion.userVote !== null && (
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${opinion.userVote === 1 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {opinion.userVote === 1 ? '👍 Your previous vote: Agree' : '👎 Your previous vote: Disagree'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-6">
              {/* Downvote Button (Left) */}
              <button
                onClick={() => handleVote('downvote')}
                disabled={!userId}
                className="flex flex-col items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!userId}
                className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp size={28} />
                <span className="font-semibold">Agree</span>
              </button>
            </div>
            {!userId && (
              <div className="text-center text-sm text-orange-600 font-medium">
                ⚠️ Please log in to vote
              </div>
            )}

            {/* Swipe & keyboard hints */}
            <div className="text-center mb-6 text-gray-600 text-sm space-y-1">
              <p>💡 Swipe left to disagree, right to agree, or use buttons below</p>
              <p className="text-gray-500">⌨️ <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-xs">←</kbd> Disagree · <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-xs">→</kbd> Agree · <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-xs">↑</kbd> Skip</p>
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
