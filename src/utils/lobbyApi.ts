/**
 * Centralized API utilities for LobbyLink
 * All API calls go through these functions for consistency and error handling
 */

import type {
  Game,
  Lobby,
  User,
  GamesResponse,
  LobbiesResponse,
  LobbyDetailsResponse,
  SuccessResponse,
  JoinResponse,
  ErrorResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));
      throw new ApiError(
        error.message || `Failed to fetch ${endpoint}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      0
    );
  }
}

/**
 * Fetch all games
 */
export async function fetchGames(): Promise<{ games: Game[] }> {
  return fetchApi<{ games: Game[] }>("/games");
}

/**
 * Fetch lobbies with optional filters
 */
export async function fetchLobbies(
  gameId?: string | null,
  page: number = 1,
  limit: number = 20
): Promise<LobbiesResponse> {
  const params = new URLSearchParams();
  if (gameId) params.append("gameId", gameId);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  return fetchApi<LobbiesResponse>(`/lobbies?${params.toString()}`);
}

/**
 * Fetch specific lobby details
 */
export async function fetchLobbyDetails(
  lobbyId: string
): Promise<LobbyDetailsResponse> {
  return fetchApi<LobbyDetailsResponse>(`/lobbies/${lobbyId}`);
}

/**
 * Create a new lobby
 */
export async function createLobby(data: {
  name: string;
  game_id: string;
  max_players: number;
  region?: string;
  skill_level?: string;
}): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>("/lobbies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Request to join a lobby
 */
export async function requestJoinLobby(
  lobbyId: string
): Promise<JoinResponse> {
  return fetchApi<JoinResponse>(`/lobbies/${lobbyId}/join`, {
    method: "POST",
  });
}

/**
 * Leave a lobby
 */
export async function leaveLobby(lobbyId: string): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>(`/lobbies/${lobbyId}/leave`, {
    method: "POST",
  });
}

/**
 * Close a lobby (host only)
 */
export async function closeLobby(lobbyId: string): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>(`/lobbies/${lobbyId}/close`, {
    method: "POST",
  });
}

/**
 * Approve a join request (host only)
 */
export async function approveLobbyRequest(
  lobbyId: string,
  requestId: string
): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>(
    `/lobbies/${lobbyId}/requests/${requestId}/approve`,
    {
      method: "POST",
    }
  );
}

/**
 * Reject a join request (host only)
 */
export async function rejectLobbyRequest(
  lobbyId: string,
  requestId: string
): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>(
    `/lobbies/${lobbyId}/requests/${requestId}/reject`,
    {
      method: "POST",
    }
  );
}

/**
 * Fetch user profile
 */
export async function fetchUserProfile(): Promise<{ user: User }> {
  return fetchApi<{ user: User }>("/users/profile");
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: Partial<User>): Promise<SuccessResponse> {
  return fetchApi<SuccessResponse>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Search lobbies
 */
export async function searchLobbies(query: string): Promise<LobbiesResponse> {
  const params = new URLSearchParams({ q: query });
  return fetchApi<LobbiesResponse>(`/lobbies/search?${params.toString()}`);
}

/**
 * Get user's joined lobbies
 */
export async function getUserLobbies(): Promise<LobbiesResponse> {
  return fetchApi<LobbiesResponse>("/users/lobbies");
}

/**
 * Get user's lobby requests
 */
export async function getUserLobbyRequests(): Promise<{
  requests: any[];
}> {
  return fetchApi<{ requests: any[] }>("/users/requests");
}
