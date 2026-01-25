import { createContext, useState, type ReactNode } from 'react';
import type { LocationInfo } from '../api/api';

export interface VoteInteraction {
  opinionId: string;
  voteType: 'upvote' | 'downvote' | 'skip';
  timestamp: string;
}

export interface UserContextType {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
  interactions: VoteInteraction[];
  addInteraction: (interaction: VoteInteraction) => void;
  updateOrAddInteraction: (interaction: VoteInteraction) => void;
  clearInteractions: () => void;
  sessionStartTime: number | null;
  sessionVotes: number;
  setSessionVotes: (votes: number) => void;
  lifetimeVotes: number;
  setLifetimeVotes: (votes: number) => void;
  opinionCount: number;
  setOpinionCount: (count: number) => void;
  opinionIds: string[];
  setOpinionIds: (ids: string[]) => void;
  location: LocationInfo | null;
  setLocation: (location: LocationInfo | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<VoteInteraction[]>([]);
  const [sessionStartTime] = useState<number | null>(() => Date.now());
  const [sessionVotes, setSessionVotes] = useState(0);
  const [lifetimeVotes, setLifetimeVotes] = useState(0);
  const [opinionCount, setOpinionCount] = useState(0);
  const [opinionIds, setOpinionIds] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  const addInteraction = (interaction: VoteInteraction) => {
    setInteractions((prev) => [...prev, interaction]);
  };

  const updateOrAddInteraction = (interaction: VoteInteraction) => {
    setInteractions((prev) => {
      const existingIndex = prev.findIndex((i) => i.opinionId === interaction.opinionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = interaction;
        return updated;
      }
      return [...prev, interaction];
    });
  };

  const clearInteractions = () => {
    setInteractions([]);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        username,
        setUsername,
        interactions,
        addInteraction,
        updateOrAddInteraction,
        clearInteractions,
        sessionStartTime,
        sessionVotes,
        setSessionVotes,
        lifetimeVotes,
        setLifetimeVotes,
        opinionCount,
        setOpinionCount,
        opinionIds,
        setOpinionIds,
        location,
        setLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
