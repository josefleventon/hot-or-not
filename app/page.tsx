'use client'

import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { codeAtom, usesAtom } from '@/atoms'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function EnterCode() {
  const [_, setCode] = useAtom(codeAtom)
  const [uses, setUses] = useAtom(usesAtom)
  const [codeData, setCodeData] = useState<string>('')

  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    try {
      const { data: res, status } = await axios.post('/api/code', {
        code: codeData,
      })
      if (status !== 200) alert('Invalid access code!')

      if (res.times_used >= 3) {
        return alert('This code has already been used.')
      }

      setCode(codeData)
      setUses(res.times_used)

      router.push('/rate')
    } catch (_) {
      alert('Invalid access code!')
    }
  }, [router, codeData, setCode, setUses])

  return (
    <main className="flex mx-4 md:mx-0 min-h-screen flex-col items-center justify-center">
      <div>
        <label
          htmlFor="code"
          className="block text-lg font-semibold leading-6 text-white"
        >
          Enter your access code
        </label>
        <div className="relative mt-2">
          <input
            type="text"
            name="code"
            id="code"
            className="peer block w-full md:w-64 mt-2 border-0 bg-zinc-800 py-3.5 text-white focus:ring-0 sm:leading-6"
            onChange={(e) => setCodeData(e.currentTarget.value.toUpperCase())}
            value={codeData}
            maxLength={5}
            placeholder="XX-00"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-800 w-full md:w-64 inline-flex justify-center items-center text-white py-2.5 mt-2"
        >
          Start rating!
        </button>
      </div>
    </main>
  )
}
