/**
 * TypeScript type definitions for LobbyLink
 */

/**
 * Game type - represents a game available on LobbyLink
 */
export interface Game {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  genre?: string;
  rating?: number;
}

/**
 * User type - represents a player
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  rank?: string;
  region?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Lobby type - represents a gaming lobby/room
 */
export interface Lobby {
  id: string;
  name: string;
  game_id: string;
  game_name: string;
  host_id: string;
  host_name: string;
  host_rank?: string;
  host_avatar?: string;
  current_players: number;
  max_players: number;
  region?: string;
  skill_level?: "beginner" | "intermediate" | "advanced" | "pro";
  is_private: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Lobby request - represents a request to join a lobby
 */
export interface LobbyRequest {
  id: string;
  lobby_id: string;
  user_id: string;
  username: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * API Response types
 */

export interface GamesResponse {
  games: Game[];
  total?: number;
}

export interface LobbiesResponse {
  lobbies: Lobby[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface LobbyDetailsResponse extends Lobby {
  requests?: LobbyRequest[];
  players?: User[];
}

export interface SuccessResponse {
  success?: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status?: number;
}

export interface JoinResponse extends SuccessResponse {
  request_id?: string;
}

/**
 * Filter and sort types
 */

export type SortBy = "recent" | "players" | "rank";

export interface LobbyFilters {
  gameId?: string | null;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "pro";
  region?: string;
  minPlayers?: number;
  maxPlayers?: number;
  searchQuery?: string;
}

export interface RequestFilters {
  sortBy?: SortBy;
  searchQuery?: string;
}

/**
 * Component props types
 */

export interface LobbyCardProps {
  lobby: Lobby;
  onJoin: (lobbyId: string) => void;
  isLoading?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterPanelProps {
  selectedGame?: string | null;
  onGameChange: (gameId: string | null) => void;
  games: Game[];
  isLoading?: boolean;
}
