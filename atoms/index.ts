import { atom } from 'jotai'

export const codeAtom = atom<string | undefined>(undefined)
export const usesAtom = atom<number>(0)
