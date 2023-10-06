'use client'

import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { codeAtom, usesAtom } from '@/atoms'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Faucet() {
  const [code] = useAtom(codeAtom)
  const [address, setAddress] = useState<string>('')

  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    if (!address) return
    if (!code) {
      alert('No access code found, redirecting to home page...')
      router.push('/')
    }
    await axios.post('/api/faucet', { address, code })
    router.push('/success')
  }, [code, address, router])

  return (
    <main className="flex min-h-screen mx-4 md:mx-0 flex-col items-center justify-center">
      <div>
        <label
          htmlFor="address"
          className="block text-lg font-semibold leading-6 text-white"
        >
          Enter your Neutron address to receive your $HACKMOS airdrop
        </label>
        <p className="block text-base mt-2 text-white/75">
          Once the betting platform is live, you will be able to use your
          $HACKMOS tokens to bet on your favorite team. IF you get it right,
          you&apos;ll receive free ATOM!
        </p>
        <div className="relative mt-4">
          <input
            type="text"
            name="address"
            id="address"
            className="peer block w-full mt-2 border-0 bg-zinc-800 py-3.5 text-white focus:ring-0 sm:leading-6"
            onChange={(e) => setAddress(e.currentTarget.value)}
            value={address}
            placeholder="neutron1..."
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-800 w-full inline-flex justify-center items-center text-white py-2.5 mt-2"
        >
          Get my $HACKMOS airdrop!
        </button>
      </div>
    </main>
  )
}
