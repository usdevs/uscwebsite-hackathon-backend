// Parses the string stored in env to number
function parseEnvToInt(envVar: string | undefined, fallback: number): number {
  return (envVar && Number(envVar)) || fallback
}

function parseEnvToString(envVar: string | undefined, fallback: string): string {
  return (envVar && envVar) || fallback
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
export const BOT_TOKEN: string = parseEnvToString(
  process.env.BOT_TOKEN,
  ""
)
