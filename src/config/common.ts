// Parses the string stored in env to number
import slugify from "slugify";
import { User } from "@prisma/client";
import { checkIsUserAdmin } from "@middlewares/checks";
import { HttpCode, HttpException } from "@exceptions/HttpException";

function parseEnvToInt(envVar: string | undefined, fallback: number): number {
  return (envVar && Number(envVar)) || fallback
}

export function getSlugFromIgName(igName: string): string {
  return slugify(igName, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    locale: 'en',
    trim: true
  })
}

// Booking constraints
export const DURATION_PER_SLOT: number = parseEnvToInt(
  process.env.DURATION_PER_SLOT,
  30
)
export const MAX_SLOTS_PER_BOOKING: number = parseEnvToInt(
  process.env.MAX_SLOTS_PER_BOOKING,
  4
)
export const MIN_SLOTS_PER_BOOKING: number = parseEnvToInt(
  process.env.MIN_SLOTS_PER_BOOKING,
  1
)
export const MIN_SLOTS_BETWEEN_BOOKINGS: number = parseEnvToInt(
  process.env.MIN_SLOTS_BETWEEN_BOOKING,
  1
)

export async function throwIfNotAdmin(userId: User["id"]) {
  if (!(await checkIsUserAdmin(userId))) {
    throw new HttpException(
      `You are not an admin.`,
      HttpCode.Forbidden
    );
  }
}
