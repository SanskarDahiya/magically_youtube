import { create } from 'zustand'

interface BearState {
  user: string | null
  setUser: (user: string | null) => void
  searchUser: string | null
  setSearchUser: (searchUser: string | null) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
}

const useAppStore = create<BearState>()((set) => ({
  user: null,
  setUser: (user) => {
    if (!user) {
      set({ isAdmin: false, searchUser: null })
    }
    set({ user, searchUser: user })
  },
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  searchUser: null,
  setSearchUser: (searchUser) => set({ searchUser }),
}))
export default useAppStore
