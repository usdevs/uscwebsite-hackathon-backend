import dotenv from 'dotenv'
import express, { Express } from 'express'
import cors from 'cors'
import { router } from './src/routes/routes'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(
  cors({
    origin: 'https://usdevs.github.io',
  })
)
app.use('/', router)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
