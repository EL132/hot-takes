import { createContext, useState, type ReactNode } from 'react';

export interface VoteInteraction {
  opinionId: string;
  voteType: 'upvote' | 'downvote' | 'skip';
  timestamp: string;
}

export interface UserContextType {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  interactions: VoteInteraction[];
  addInteraction: (interaction: VoteInteraction) => void;
  clearInteractions: () => void;
  sessionStartTime: number | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<VoteInteraction[]>([]);
  const [sessionStartTime] = useState<number | null>(() => Date.now());

  const addInteraction = (interaction: VoteInteraction) => {
    setInteractions((prev) => [...prev, interaction]);
  };

  const clearInteractions = () => {
    setInteractions([]);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        interactions,
        addInteraction,
        clearInteractions,
        sessionStartTime,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
