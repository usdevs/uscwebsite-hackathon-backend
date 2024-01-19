// Development middleware for dev endpoints

import { Request, Response } from 'express'

export async function devOnly(req: Request, res: Response, next: Function) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).send('Not found')
  }

  next()
}
