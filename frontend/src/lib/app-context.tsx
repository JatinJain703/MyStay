"use client";

// Global app state for the mocked auth model + wishlist.
// - `currentUser` is the active identity, persisted to localStorage so it
//   survives reloads (the "login" for this assignment).
// - wishlist ids are cached here so any card can render its favorite state.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "./api";
import type { User } from "./types";

interface AppState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  switchUser: (id: number) => void;
  becomeHost: () => Promise<void>;
  wishlistIds: Set<number>;
  toggleWishlist: (listingId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);
const STORAGE_KEY = "airbnb_clone_user_id";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load users and restore the saved identity (default to first user).
  useEffect(() => {
    (async () => {
      try {
        const list = await api.listUsers();
        setUsers(list);
        const savedId = Number(localStorage.getItem(STORAGE_KEY));
        const initial = list.find((u) => u.id === savedId) ?? list[0] ?? null;
        setCurrentUser(initial);
      } catch {
        toast.error("Could not reach the API. Is the backend running on :8000?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Whenever the identity changes, load that user's wishlist ids.
  useEffect(() => {
    if (!currentUser) return;
    api.getWishlistIds(currentUser.id).then((ids) => setWishlistIds(new Set(ids))).catch(() => {});
  }, [currentUser]);

  const switchUser = useCallback(
    (id: number) => {
      const user = users.find((u) => u.id === id) ?? null;
      setCurrentUser(user);
      if (user) {
        localStorage.setItem(STORAGE_KEY, String(user.id));
        toast.success(`Switched to ${user.name}`);
      }
    },
    [users],
  );

  const refreshUser = useCallback(async () => {
    const list = await api.listUsers();
    setUsers(list);
    if (currentUser) setCurrentUser(list.find((u) => u.id === currentUser.id) ?? currentUser);
  }, [currentUser]);

  const becomeHost = useCallback(async () => {
    if (!currentUser) return;
    const updated = await api.becomeHost(currentUser.id);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setCurrentUser(updated);
    toast.success("You're a host now! Create your first listing.");
  }, [currentUser]);

  const toggleWishlist = useCallback(
    async (listingId: number) => {
      if (!currentUser) return;
      // Optimistic update.
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.has(listingId) ? next.delete(listingId) : next.add(listingId);
        return next;
      });
      try {
        const res = await api.toggleWishlist(currentUser.id, listingId);
        toast.success(res.favorited ? "Saved to wishlist" : "Removed from wishlist");
      } catch {
        // Roll back on failure.
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.has(listingId) ? next.delete(listingId) : next.add(listingId);
          return next;
        });
        toast.error("Could not update wishlist");
      }
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({ users, currentUser, loading, switchUser, becomeHost, wishlistIds, toggleWishlist, refreshUser }),
    [users, currentUser, loading, switchUser, becomeHost, wishlistIds, toggleWishlist, refreshUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
