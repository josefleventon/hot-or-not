'use client'

import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { codeAtom, usesAtom } from '@/atoms'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'
import { Idea } from '@/types'

export default function Rate() {
  const [code] = useAtom(codeAtom)
  const [uses, setUses] = useAtom(usesAtom)

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: res } = await axios.get('/api/ideas')
      const ideas = res.ideas

      console.log('Fetched ideas', ideas[0], ideas[1])

      setIdeas(ideas)
      setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
      console.error(e)
    }
  }, [])

  const submitResult = useCallback(
    async (winning_idea: number, losing_idea: number) => {
      setIsLoading(true)
      try {
        if (!code) {
          alert('No access code found, redirecting to home page...')
          router.push('/')
        }
        await axios.post('/api/rate', {
          code,
          winning_idea,
          losing_idea,
        })

        if (uses + 1 >= 3) {
          router.push('/faucet')
        }

        setUses(uses + 1)
        fetchIdeas()
      } catch (e) {
        setIsLoading(false)
        console.error(e)
      }
    },
    [router, code, fetchIdeas, setUses, uses]
  )

  return (
    <main>
      <div className="absolute top-0 left-0 w-screen">
        <div className="grid grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={classNames(
                (uses ?? -1) >= n - 1 ? 'bg-blue-600' : 'bg-zinc-800',
                'h-6'
              )}
            ></div>
          ))}
        </div>
        {isLoading || ideas.length < 2 ? (
          <div className="flex justify-center items-center w-screen h-screen">
            <svg
              className="animate-spin ml-2 mr-3 h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center w-screen h-screen">
            <h1 className="text-2xl text-center text-white font-bold">
              Which of these projects is more likely to win?
            </h1>
            <div className="mt-8 max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => submitResult(ideas[0].id, ideas[1].id)}
                className="border-zinc-800 py-8 px-8 border rounded-md hover:bg-white group inline-flex flex-col space-y-1 justify-center items-center"
              >
                <span className="text-base font-bold text-white group-hover:text-black">
                  {ideas[0].text}
                </span>
                <span className="text-sm font-medium text-white/75 group-hover:text-black">
                  {ideas[0].tracks.split(',').join(' | ')}
                </span>
              </button>
              <button
                onClick={() => submitResult(ideas[1].id, ideas[0].id)}
                className="border-zinc-800 py-8 px-8 border rounded-md hover:bg-white group inline-flex flex-col space-y-1 justify-center items-center"
              >
                <span className="text-base font-bold text-white group-hover:text-black">
                  {ideas[1].text}
                </span>
                <span className="text-sm font-medium text-white/75 group-hover:text-black">
                  {ideas[1].tracks.split(',').join(' | ')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
