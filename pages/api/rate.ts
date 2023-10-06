import EloRank from 'elo-rank'
import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { code, winning_idea, losing_idea } = req.body

    console.log(req.body)

    if (!code || !winning_idea || !losing_idea) {
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

      const eloQuery = `
        SELECT elo
        FROM ideas
        WHERE id = $1
      `

      // Get the elo of the winning idea
      const winningEloResult = await client.query(eloQuery, [winning_idea])

      if (winningEloResult.rows.length === 0) {
        return res.status(404).json({ error: 'Winning idea not found.' })
      }

      const winningElo = parseInt(winningEloResult.rows[0].elo)

      // Get the elo of the losing idea
      const losingEloResult = await client.query(eloQuery, [losing_idea])

      if (losingEloResult.rows.length === 0) {
        return res.status(404).json({ error: 'Losing idea not found.' })
      }

      const losingElo = parseInt(losingEloResult.rows[0].elo)

      console.log(winningElo, losingElo)

      // Calculate the new elo
      const elo = new EloRank(15)
      const expectedWinningElo = elo.getExpected(winningElo, losingElo)
      const expectedLosingElo = elo.getExpected(losingElo, winningElo)

      console.log(expectedWinningElo, expectedLosingElo)

      const newWinningElo = elo.updateRating(expectedWinningElo, 1, winningElo)
      const newLosingElo = elo.updateRating(expectedLosingElo, 0, losingElo)

      console.log(newWinningElo, newLosingElo)

      // Update the elo of the winning idea
      const updateEloQuery = `
        UPDATE ideas
        SET elo = $1
        WHERE id = $2
      `

      await client.query(updateEloQuery, [newWinningElo, winning_idea])
      await client.query(updateEloQuery, [newLosingElo, losing_idea])

      const updateTimesUsedQuery = `
        UPDATE codes
        SET times_used = times_used + 1
        WHERE id = $1
      `

      await client.query(updateTimesUsedQuery, [code])

      client.release()

      res.status(200).end()
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while rating.' })
    } finally {
      pool.end()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' })
  }
}
