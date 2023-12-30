import { UserOnOrg, Venue } from '@prisma/client'
import { BookingPayload } from '@/services/bookings'
import { prisma } from '../../db'
import readXlsxFile from 'read-excel-file/node'

export const getDevSheetName = (name: string) => `Test ${name}`

export function parseEnvToInt(
  envVar: string | undefined,
  fallback: number
): number {
  return (envVar && Number(envVar)) || fallback
}

export async function generateBookingData(
  size: number,
  maxSlots: number,
  minSlots: number,
  duration: number
) {
  const allUserOnOrg: Array<UserOnOrg> = await prisma.userOnOrg.findMany()
  const allVenues: Array<Venue> = await prisma.venue.findMany()

  function getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime()
    const toTime = to.getTime()
    const result = new Date(fromTime + Math.random() * (toTime - fromTime))
    result.setMinutes(
      result.getMinutes() - (result.getMinutes() % duration),
      0,
      0
    )
    return result
  }

  const bookingData: BookingPayload[] = []

  const bookingDurationData = [...Array(maxSlots - minSlots + 1).keys()].map(
    (i) => (i + minSlots) * duration
  )

  for (let i = 0; i < size; i++) {
    const userOnOrg =
      allUserOnOrg[Math.floor(Math.random() * allUserOnOrg.length)]
    const venue = allVenues[Math.floor(Math.random() * allVenues.length)]
    const bookingDuration =
      bookingDurationData[
        Math.floor(Math.random() * bookingDurationData.length)
      ]
    const startDate = getRandomDate(
      new Date(Date.now() - 12096e5),
      new Date(Date.now() + 12096e5)
    ) // Magic number because who cares

    const booking = {
      venueId: venue.id!,
      userId: userOnOrg.userId,
      userOrgId: userOnOrg.orgId,
      start: startDate,
      end: new Date(startDate.getTime() + bookingDuration * 60000), // more magicc
      eventName: Math.random().toString(36).slice(2, 7),
    }

    bookingData.push(booking)
  }
  return bookingData
}

export const ReadRowsFromExcel = async <T>(
  excelFile: string,
  sheet: string,
  schema: any
): Promise<T[]> => {
  const { rows, errors } = await readXlsxFile(excelFile, { sheet, schema })

  if (errors.length !== 0) throw new Error(errors[0].error)

  return rows as T[]
}
