import dotenv from 'dotenv'
import express, { Express } from 'express'
import cors from 'cors'
import { router } from '@routes/routes'
import errorHandler from '@middlewares/error.middleware'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://localhost:3001", "https://frontend.local.dev", "https://usdevs.github.io", "https://nusc.club"]
      : ["https://usdevs.github.io", "https://nusc.club"]
  })
)
app.use('/', router)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
