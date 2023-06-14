import { create } from 'zustand'

interface BearState {
  user: string | null
  setUser: (user: string | null) => void
}

const useUserStore = create<BearState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
export default useUserStore
