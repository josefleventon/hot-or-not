import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Invalid input data.' })
    }

    const pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASS,
      ssl: { rejectUnauthorized: false },
      port: 5432,
    })

    try {
      const client = await pool.connect()

      const checkQuery = `
        SELECT times_used
        FROM codes
        WHERE id = $1
      `

      const result = await client.query(checkQuery, [code])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Code not found.' })
      }

      const timesUsed = result.rows[0].times_used

      client.release()

      res.status(200).json({ times_used: timesUsed })
    } catch (error) {
      res.status(500).json({ error })
    } finally {
      pool.end()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' })
  }
}
