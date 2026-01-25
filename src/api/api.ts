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
  createdAt: string;
  authorId: string;
  voteCount: number;
}

export interface LeaderboardOpinion {
  id: string;
  content: string;
  voteCount: number;
  createdAt: string;
}

/* =======================
   Backend Response Types
======================= */

interface BackendLeaderboardOpinion {
  id: string;
  content: string;
  voteCount: number;
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

/* =======================
   Opinions
======================= */

export const getOpinion = async (exclude: string[] = []): Promise<Opinion> => {
  const excludeParam = exclude.length > 0 ? `?exclude=${exclude.join(',')}` : '';
  const response = await apiCall('GET', `/api/opinions/next${excludeParam}`);
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

export const voteOnOpinion = async (
  opinionId: string,
  value: 1 | -1
): Promise<unknown> => {
  const response = await apiCall('POST', `/api/opinions/${opinionId}/vote`, {
    vote: value,
  });
  if (!response.ok) throw new Error('Failed to submit vote');
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

  // Normalize backend response to frontend shape
  return data.opinions.map((opinion) => ({
    id: opinion.id,
    content: opinion.content,
    voteCount: opinion.voteCount,
    createdAt: opinion.dateSubmitted, // normalized field name
  }));
};