// With reference to: https://www.prisma.io/blog/fullstack-nextjs-graphql-prisma-4-1k1kc83x3v#development-environment
// We can directly access the image via the image url (https://s3.amazonaws.com/bucketname/imagename.jpg)

import { getImageUrl, upsertImageUrl } from '@/services/images'
import aws from 'aws-sdk'
import { Response, Request, NextFunction } from 'express'

export async function postImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.APP_AWS_ACCESS_KEY,
      secretAccessKey: process.env.APP_AWS_SECRET_KEY,
      region: process.env.APP_AWS_REGION,
    })

    aws.config.update({
      accessKeyId: process.env.APP_AWS_ACCESS_KEY,
      secretAccessKey: process.env.APP_AWS_SECRET_KEY,
      region: process.env.APP_AWS_REGION,
      signatureVersion: 'v4',
    })

    const post = await s3.createPresignedPost({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Fields: {
        key: req.query.file,
      },
      Expires: 60, // seconds
      Conditions: [
        ['content-length-range', 0, 5048576], // up to 1 MB
      ],
    })

    // Add image url to database
    await upsertImageUrl(req.query.type, req.query.id, post.url)

    return res.status(200).json(post)
  } catch (error) {
    next(error)
  }
}

export async function getImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const imageUrl = await getImageUrl(req.query.type, req.query.id)
    return res.status(200).json(imageUrl)
  } catch (error) {
    next(error)
  }
}
