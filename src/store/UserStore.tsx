import { create } from 'zustand'

interface BearState {
  user: string | null
  setUser: (user: string | null) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
}

const useUserStore = create<BearState>()((set) => ({
  user: null,
  setUser: (user) => {
    if (!user) {
      set({ isAdmin: false })
    }
    set({ user })
  },
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}))
export default useUserStore
