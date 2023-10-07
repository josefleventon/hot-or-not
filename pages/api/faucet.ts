import { sendTokensFromFaucet } from '@/airdrop'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { address } = req.body

    if (!address) {
      return res.status(400).json({ error: 'Address is required.' })
    }

    try {
      await sendTokensFromFaucet(address)

      res.status(200).end()
    } catch (error) {
      res
        .status(500)
        .json({ error: 'An error occurred while using the faucet.' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' })
  }
}
