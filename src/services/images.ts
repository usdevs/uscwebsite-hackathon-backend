import prisma from './db'

export async function upsertImageUrl(type: string, id: number, url: string) {
  // Add image url to database
  if (type === 'user') {
    await prisma.userDisplayImage.upsert({
      where: {
        userId: id,
      },
      update: {
        url: url,
      },
      create: {
        userId: id,
        url: url,
      },
    })
  } else if (type === 'organisation') {
    await prisma.orgDisplayImage.upsert({
      where: {
        orgId: id,
      },
      update: {
        url: url,
      },
      create: {
        orgId: id,
        url: url,
      },
    })
  }
}

export async function getImageUrl(type: string, id: number) {
  if (type === 'user') {
    await prisma.userDisplayImage.findFirst({
      where: {
        userId: id,
      },
    })
  } else if (type === 'organisation') {
    await prisma.orgDisplayImage.findFirst({
      where: {
        orgId: id,
      },
    })
  }
}
