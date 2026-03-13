import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RoleId } from '@/types/game'

interface PlayerStore {
  playerId: string | null
  pin: string | null
  roleId: RoleId | null
  playerName: string | null
  setPlayer: (data: { playerId: string; pin: string; roleId: RoleId; playerName: string }) => void
  clear: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      playerId: null,
      pin: null,
      roleId: null,
      playerName: null,
      setPlayer: ({ playerId, pin, roleId, playerName }) =>
        set({ playerId, pin, roleId, playerName }),
      clear: () => set({ playerId: null, pin: null, roleId: null, playerName: null }),
    }),
    {
      name: 'dss-player',
      storage: {
        getItem: (name) => {
          if (typeof sessionStorage === 'undefined') return null
          const v = sessionStorage.getItem(name)
          return v ? JSON.parse(v) : null
        },
        setItem: (name, value) => {
          if (typeof sessionStorage !== 'undefined')
            sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
