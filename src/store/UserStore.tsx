import { IUser } from '@/dbTypes'
import { create } from 'zustand'

interface BearState {
  user: Partial<IUser> | null
  setUser: (user: Partial<IUser> | null) => void
  searchUser: string | null
  setSearchUser: (searchUser: string | null) => void
}

const useAppStore = create<BearState>()((set) => ({
  user: null,
  setUser: (user) => {
    set({ user, searchUser: user?.email })
  },
  searchUser: null,
  setSearchUser: (searchUser) => set({ searchUser }),
}))
export default useAppStore
