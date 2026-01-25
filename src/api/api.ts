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
  const url = `http://localhost:5000${endpoint}`;
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
  userId: string
): Promise<unknown> => {
  const response = await apiCall('POST', '/api/opinions', { content, userId });
  if (!response.ok) throw new Error('Failed to submit opinion');
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