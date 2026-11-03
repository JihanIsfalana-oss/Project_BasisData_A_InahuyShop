import express from 'express'
import dotenv from 'dotenv'
import { API_HEALTH_MESSAGE } from '@inahuyshop/contracts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: API_HEALTH_MESSAGE,
  })
})

app.listen(PORT, () => {
  console.log(`InahuyShop API running on port ${PORT}`)
})
