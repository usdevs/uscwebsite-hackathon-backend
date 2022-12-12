import dotenv from 'dotenv'
import express, { Express } from 'express'
import cors from 'cors'
import { router } from './src/routes/routes'
import errorHandler from './src/middlewares/errorHandler'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(
  cors({
    origin: 'https://usdevs.github.io',
  })
)
app.use('/', router)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
