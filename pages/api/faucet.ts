import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg' // Assuming you're using PostgreSQL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { address, code } = req.body

    if (!address || !code) {
      return res.status(400).json({ error: 'Address and code are required.' })
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

      const timesUsed = parseInt(result.rows[0].times_used)

      if (timesUsed < 3) {
        return res
          .status(403)
          .json({ error: 'Code has not been used enough times.' })
      }

      // Insert the address into the "addresses" table
      const insertQuery = `
        INSERT INTO addresses (address)
        VALUES ($1)
        RETURNING id;
      `

      const insertResult = await client.query(insertQuery, [address])
      const insertedId = insertResult.rows[0].id

      client.release()

      res.status(201).json({ id: insertedId, address: address })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'An error occurred while inserting the address.' })
    } finally {
      pool.end()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' })
  }
}
