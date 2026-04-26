import React, { useState, useMemo } from "react";
import useUser from "@/utils/useUser";
import Navbar from "@/components/Navbar";
import usePresence from "@/utils/usePresence";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Gamepad2,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Star,
  Trophy,
  ShieldCheck,
  Zap,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import type { Lobby, Game, SortBy } from "@/types";
import { fetchGames, fetchLobbies, requestJoinLobby, ApiError } from "@/utils/lobbyApi";

export default function Dashboard() {
  usePresence();
  const { data: user } = useUser();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);

  // Fetch games
  const {
    data: gamesData,
    isLoading: gamesLoading,
    isError: gamesError,
    error: gamesErrorMsg,
  } = useQuery({
    queryKey: ["games"],
    queryFn: fetchGames,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch lobbies
  const {
    data: lobbiesData,
    isLoading: lobbiesLoading,
    isError: lobbiesError,
    error: lobbiesErrorMsg,
    refetch: refetchLobbies,
  } = useQuery({
    queryKey: ["lobbies", selectedGame],
    queryFn: () => fetchLobbies(selectedGame),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 10, // Refetch every 10 seconds
  });

  // Memoized filtered and sorted lobbies
  const filteredLobbies = useMemo(() => {
    let result = lobbiesData?.lobbies || [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lobby) =>
          lobby.name.toLowerCase().includes(query) ||
          lobby.host_name.toLowerCase().includes(query) ||
          lobby.game_name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...result];
    switch (sortBy) {
      case "players":
        sorted.sort((a, b) => b.current_players - a.current_players);
        break;
      case "rank":
        sorted.sort((a, b) =>
          (a.host_rank || "UNRANKED").localeCompare(b.host_rank || "UNRANKED")
        );
        break;
      case "recent":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return sorted;
  }, [lobbiesData?.lobbies, searchQuery, sortBy]);

  // Handle join lobby
  const handleJoinLobby = async (lobbyId: string) => {
    try {
      setJoiningLobbyId(lobbyId);
      await requestJoinLobby(lobbyId);
      // Show success toast
      console.log("Join request sent successfully");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to send join request";
      console.error(message);
    } finally {
      setJoiningLobbyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-inter">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative h-64 rounded-3xl overflow-hidden mb-12 border border-[#222] group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000] to-transparent z-10"></div>
          <img
            src="https://e1a4c9d0d2f9f737c5e1.ucr.io/-/preview/https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            alt="Hero"
          />
          <div className="absolute inset-0 z-20 p-10 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">
              Level Up Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Squad
              </span>
            </h1>
            <p className="text-gray-300 max-w-lg mb-6 font-medium">
              Find teammates in real-time. Whether you're climbing ranks or just
              gaming for fun, LobbyLink connects you instantly.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase rounded-lg transition-all transform hover:-translate-y-1">
                Start Lobby
              </button>
              <button className="px-8 py-3 bg-[#111] border border-[#333] hover:border-cyan-500 text-white font-black uppercase rounded-lg transition-all">
                Quick Find
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                Top Games
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedGame(null)}
                  aria-label="Show all games"
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    !selectedGame
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                      : "bg-[#111] border border-[#222] text-gray-400 hover:border-[#333]"
                  }`}
                >
                  <span className="text-sm font-bold">All Games</span>
                  <LayoutGrid size={16} />
                </button>
                {gamesLoading ? (
                  <div className="py-4 text-center text-gray-500">Loading...</div>
                ) : gamesError ? (
                  <div className="py-4 text-center text-red-500 text-xs">
                    Failed to load games
                  </div>
                ) : (
                  gamesData?.games?.map((game: Game) => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game.id)}
                      aria-label={`Filter by ${game.name}`}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        selectedGame === game.id
                          ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                          : "bg-[#111] border border-[#222] text-gray-400 hover:border-[#333]"
                      }`}
                    >
                      <span className="text-sm font-bold">{game.name}</span>
                      <Gamepad2 size={16} />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-[#222]">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-fuchsia-500" size={20} />
                <h3 className="font-black uppercase tracking-tight italic">
                  Go Premium
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Get boosted profile visibility, advanced rank filters, and
                ad-free experience.
              </p>
              <button className="w-full py-3 bg-[#111] border border-[#222] hover:border-fuchsia-500 text-fuchsia-500 font-black uppercase tracking-widest text-[10px] rounded-lg transition-all">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Main Lobby Board */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-tight italic">
                  Live Lobbies
                </h2>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-black uppercase rounded animate-pulse">
                  {filteredLobbies?.length || 0} active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={14}
                  />
                  <input
                    placeholder="Search Lobby..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search lobbies by name or host"
                    className="bg-[#111] border border-[#222] rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-cyan-500 w-48 md:w-64 transition-all"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  aria-label="Sort lobbies"
                  className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="recent">Recent</option>
                  <option value="players">Most Players</option>
                  <option value="rank">Highest Rank</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {lobbiesError && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-4">
                <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-black text-red-500 uppercase">Error Loading Lobbies</h3>
                  <p className="text-sm text-red-400">
                    {lobbiesErrorMsg instanceof Error
                      ? lobbiesErrorMsg.message
                      : "Failed to load lobbies. Please try again."}
                  </p>
                </div>
                <button
                  onClick={() => refetchLobbies()}
                  className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 font-black text-xs rounded"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Lobbies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lobbiesLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-[#111] border border-[#222] animate-pulse"
                    >
                      <div className="h-8 bg-[#222] rounded mb-4"></div>
                      <div className="h-6 bg-[#222] rounded mb-4 w-3/4"></div>
                      <div className="h-12 bg-[#222] rounded"></div>
                    </div>
                  ))}
                </>
              ) : filteredLobbies?.length > 0 ? (
                filteredLobbies.map((lobby: Lobby) => (
                  <div
                    key={lobby.id}
                    className="p-5 rounded-2xl bg-[#111] border border-[#222] hover:border-[#333] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">
                          {lobby.game_name}
                        </p>
                        <h4 className="font-black text-lg group-hover:text-cyan-400 transition-colors uppercase italic">
                          {lobby.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users size={14} />
                          <span className="text-xs font-black">
                            {lobby.current_players}/{lobby.max_players}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-[#222]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#111] overflow-hidden border border-[#222]">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lobby.host_id}`}
                            alt={`${lobby.host_name}'s avatar`}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            Host
                          </p>
                          <p className="text-xs font-black uppercase italic">
                            {lobby.host_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20">
                        <Trophy size={10} className="text-fuchsia-500" />
                        <span className="text-[10px] font-black text-fuchsia-500 uppercase">
                          {lobby.host_rank || "UNRANKED"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinLobby(lobby.id)}
                      disabled={
                        joiningLobbyId === lobby.id ||
                        lobby.current_players === lobby.max_players
                      }
                      aria-label={`Request to join ${lobby.name}`}
                      aria-busy={joiningLobbyId === lobby.id}
                      className={`w-full mt-4 py-2.5 font-black uppercase text-[10px] tracking-widest rounded-lg transition-all border ${
                        lobby.current_players === lobby.max_players
                          ? "bg-gray-600 border-gray-700 text-gray-400 cursor-not-allowed"
                          : joiningLobbyId === lobby.id
                          ? "bg-cyan-500 border-cyan-400 text-black"
                          : "bg-[#1a1a1a] hover:bg-cyan-500 hover:text-black border-[#222] hover:border-cyan-400 text-white"
                      }`}
                    >
                      {joiningLobbyId === lobby.id
                        ? "Joining..."
                        : lobby.current_players === lobby.max_players
                        ? "Lobby Full"
                        : "Request Join"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-[#111] rounded-3xl border border-[#222] border-dashed">
                  <Gamepad2 size={48} className="mx-auto text-gray-700 mb-4" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-500">
                    No Lobbies Found
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Try changing your filters or create a new lobby.
                  </p>
                  <button className="mt-6 px-8 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black uppercase rounded-lg hover:bg-cyan-500 hover:text-black transition-all">
                    Create One
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
