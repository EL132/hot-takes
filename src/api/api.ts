// Profanity filter using API Ninjas
export const filterProfanity = async (text: string): Promise<{ censored: string; has_profanity: boolean }> => {
  const apiKey = import.meta.env.VITE_API_NINJAS_KEY;
  if (!apiKey) throw new Error('Profanity filter API key not set');
  const params = new URLSearchParams();
  params.append('text', text);
  const response = await fetch(`https://api.api-ninjas.com/v1/profanityfilter?${params.toString()}`, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
    },
  });
  if (!response.ok) throw new Error('Profanity filter API error');
  const data = await response.json();
  return { censored: data.censored, has_profanity: data.has_profanity };
};
// Get leaderboard for user's region
export const getLeaderboardNearMe = async (
  region: string,
  limit: number = 10
): Promise<LeaderboardOpinion[]> => {
  if (!region) throw new Error('Region is required');
  const params = new URLSearchParams();
  params.append('region', region);
  params.append('limit', limit.toString());

  const response = await apiCall('GET', `/api/leaderboard/near-me?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch regional leaderboard');
  }
  const data: BackendLeaderboardResponse = await response.json();
  return data.opinions;
};
// Location info type for region detection
export interface LocationInfo {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone?: string | null;
}

// Fetch location from backend
export const getLocation = async (): Promise<LocationInfo> => {
  const response = await apiCall('GET', '/api/location');
  if (!response.ok) throw new Error('Failed to fetch location');
  return response.json();
};
/**
 * API utility functions with JWT token authentication
 */

import { getAuthToken } from '../auth';

/* =======================
   Shared Types
======================= */

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  sessionVotes?: number;
  lifetimeVotes?: number;
  opinionCount?: number;
  opinionIds?: string[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface Opinion {
  id: string;
  content: string;
  dateSubmitted: string;
  authorId?: string;
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
  location?: {
    region?: string | null;
    city?: string | null;
    country?: string | null;
  };
}

export interface LeaderboardOpinion {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  dateSubmitted: string;
}

/* =======================
   Backend Response Types
======================= */

interface BackendLeaderboardOpinion {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  dateSubmitted: string;
}

interface BackendLeaderboardResponse {
  opinions: BackendLeaderboardOpinion[];
}

/* =======================
   Helpers
======================= */

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiCall = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown
): Promise<Response> => {
  const url = `https://hot-takes-backend-tcxr.onrender.com${endpoint}`;
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
};

/* =======================
   Auth
======================= */

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiCall('POST', '/api/auth/register', {
    username,
    email,
    password,
  });

  if (!response.ok) throw new Error('Failed to register');
  return response.json();
};

export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiCall('POST', '/api/auth/login', {
    username,
    password,
  });

  if (!response.ok) throw new Error('Failed to login');
  return response.json();
};

export const signin = async (): Promise<unknown> => {
  const response = await apiCall('POST', '/api/auth/signin');
  if (!response.ok) throw new Error('Failed to sign in');
  return response.json();
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiCall('GET', '/api/auth/user');
  if (!response.ok) throw new Error('Failed to get current user');
  return response.json();
};

export const getUserProfile = async (userId: string): Promise<AuthUser> => {
  const response = await apiCall('GET', `/api/auth/user?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to get user profile');
  return response.json();
};

export const resetSession = async (): Promise<unknown> => {
  const response = await apiCall('POST', '/api/auth/reset-session');
  if (!response.ok) throw new Error('Failed to reset session');
  return response.json();
};

/* =======================
   Opinions
======================= */

export const getOpinion = async (exclude: string[] = [], userId?: string): Promise<Opinion> => {
  const params = new URLSearchParams();
  if (exclude.length > 0) {
    params.append('exclude', exclude.join(','));
  }
  if (userId) {
    params.append('userId', userId);
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiCall('GET', `/api/opinions/next${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch opinion');
  return response.json();
};

export const submitOpinion = async (
  content: string,
  userId: string,
  location?: string
): Promise<unknown> => {
  const response = await apiCall('POST', '/api/opinions', { content, userId, location });
  if (!response.ok) throw new Error('Failed to submit opinion');
  return response.json();
};

export const getOpinionById = async (opinionId: string): Promise<Opinion> => {
  const response = await apiCall('GET', `/api/opinions/${opinionId}`);
  if (!response.ok) throw new Error('Failed to fetch opinion by id');
  return response.json();
};


export interface VoteStatus {
  hasVoted: boolean;
  voteValue: 1 | -1 | null;
}

export interface VoteResponse {
  message: string;
  opinion: {
    id: string;
    content: string;
    upvotes: number;
    downvotes: number;
    userVote: 1 | -1 | null;
  };
}

export const voteOnOpinion = async (
  opinionId: string,
  value: 1 | -1,
  userId: string
): Promise<VoteResponse> => {
  const response = await apiCall('POST', `/api/opinions/${opinionId}/vote`, {
    vote: value,
    userId,
  });
  if (!response.ok) throw new Error('Failed to submit vote');
  return response.json();
};

export const checkVoteStatus = async (
  opinionId: string,
  userId: string
): Promise<VoteStatus> => {
  const response = await apiCall(
    'GET',
    `/api/opinions/${opinionId}/vote-status?userId=${encodeURIComponent(userId)}`
  );
  if (!response.ok) throw new Error('Failed to check vote status');
  return response.json();
};

/* =======================
   Leaderboard
======================= */

export const getLeaderboard = async (
  limit: number = 10,
  type: 'top' | 'new' = 'top'
): Promise<LeaderboardOpinion[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('type', type);

  const response = await apiCall(
    'GET',
    `/api/leaderboard/top?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data: BackendLeaderboardResponse = await response.json();
  return data.opinions;
};
