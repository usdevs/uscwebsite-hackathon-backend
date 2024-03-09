import { prisma } from '../../db'

export const DEV_TELEGRAM_USERNAME =
  process.env.PRISMA_SEED_USER_TELEGRAM_USERNAME
export const DEV_TELEGRAM_ID = process.env.PRIMSA_SEED_USER_TELEGRAM_ID

export const seedDevInfo = async () => {
  if (!DEV_TELEGRAM_ID || !DEV_TELEGRAM_USERNAME) return

  console.info(`Seeding dev user with username ${DEV_TELEGRAM_USERNAME}...`)

  const devUser = await prisma.user.findFirst({
    where: {
      telegramUserName: DEV_TELEGRAM_USERNAME,
    },
  })

  if (!devUser) {
    console.info(
      `No dev user "${DEV_TELEGRAM_USERNAME}" found, skipping operation.`
    )
    return
  }

  console.info(`Found dev user "${DEV_TELEGRAM_USERNAME}", adding telegram ID.`)
  prisma.user
    .update({
      where: {
        id: devUser.id,
      },
      data: {
        telegramId: DEV_TELEGRAM_ID,
      },
    })
    .catch((e) => {
      console.error(
        `Error adding telegram ID to user "${DEV_TELEGRAM_USERNAME}":`,
        e
      )
    })
    .finally(() => {
      console.info(
        `Successfully added telegram ID to user "${DEV_TELEGRAM_USERNAME}".`
      )
    })
}
