import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
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

      // Query to retrieve 2 random ideas
      const randomIdeasQuery = `
        SELECT *
        FROM ideas
        ORDER BY RANDOM()
        LIMIT 2
      `

      const result = await client.query(randomIdeasQuery)

      client.release()

      const randomIdeas = result.rows

      res.status(200).json({ ideas: randomIdeas })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'An error occurred while fetching random ideas.' })
    } finally {
      pool.end()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' })
  }
}
