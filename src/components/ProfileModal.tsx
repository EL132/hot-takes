import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '../context/useUser';
import { getUserProfile, getOpinionById } from '../api/api'; // <-- import getOpinion
import type { AuthUser } from '../api/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface OpinionDetails {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  dateSubmitted: string;
}

export function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const { userId, username, lifetimeVotes, opinionCount, opinionIds } = useUser();
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [opinions, setOpinions] = useState<OpinionDetails[]>([]);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId]);

  // Fetch opinion details for each opinionId
  useEffect(() => {
    const ids = userProfile?.opinionIds ?? opinionIds;
    if (!isOpen || !ids || ids.length === 0) {
      setOpinions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
        ids.map(async (id: string) => {
            try {
            const opinion = await getOpinionById(id);
            return {
                id: opinion.id,
                content: opinion.content,
                upvotes: opinion.upvotes,
                downvotes: opinion.downvotes,
                dateSubmitted: opinion.dateSubmitted,
            };
            } catch {
            return null;
            }
        })
        ).then(results => {
        if (!cancelled) {
            setOpinions(results.filter(Boolean) as OpinionDetails[]);
            setLoading(false);
        }
    });


    return () => {
      cancelled = true;
    };
  }, [isOpen, userProfile, opinionIds]);

  if (!isOpen) return null;

  const stats = {
    lifetimeVotes: userProfile?.lifetimeVotes ?? lifetimeVotes,
    opinionCount: userProfile?.opinionCount ?? opinionCount,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-end pb-20">
      <div className="bg-white w-full rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Username</p>
            <p className="text-xl font-bold text-gray-900">{username || 'User'}</p>
          </div>

          {/* Lifetime Stats */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Lifetime Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total Votes</p>
                <p className="text-lg font-bold text-purple-600">{stats.lifetimeVotes || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Opinions Submitted</p>
                <p className="text-lg font-bold text-orange-600">{stats.opinionCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Opinion History */}
          {opinions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Your Opinions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {opinions.map((opinion, index) => (
                  <div key={opinion.id} className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-200 rounded-full px-2 py-1 min-w-fit">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{opinion.content}</span>
                    </div>
                    <div className="flex gap-3 mt-1 ml-7">
                      <span className="text-xs text-green-600 font-semibold">👍 {opinion.upvotes}</span>
                      <span className="text-xs text-red-500 font-semibold">👎 {opinion.downvotes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}