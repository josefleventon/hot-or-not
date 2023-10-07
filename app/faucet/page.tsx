'use client'

import { useCallback, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Faucet() {
  const [address, setAddress] = useState<string>('')

  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    if (!address) return
    await axios.post('/api/faucet', { address })
    router.push('https://wagemos.com')
  }, [address, router])

  return (
    <main className="flex min-h-screen mx-4 md:mx-0 flex-col items-center justify-center">
      <div>
        <label
          htmlFor="address"
          className="block text-lg font-semibold leading-6 text-white"
        >
          Enter your Neutron address to receive your $HACKMOS airdrop
        </label>
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
