import { getImage } from '../../utils/formidable'
import { uploadImage } from '../../utils/cloudinary'

import prisma from '@/services/db'
import { Request, Response } from 'express'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handle(req: Request, res: Response) {
  const imageUploaded = await getImage(req)

  const imageData = await uploadImage(imageUploaded.path)

  const result = await prisma.displayImage.create({
    data: {
      publicId: imageData.public_id,
      format: imageData.format,
      version: imageData.version.toString(),
    },
  })

  res.json(result)
}
