/* Represents a booking */
export type Booking = {
  userId: number
  orgId: number
  venueId: number
  start: Date
  end: Date
}

/* Information to update a booking */
export type UpdatedBooking = {
  userId?: number
  orgId?: number
  venueId?: number
  start?: Date
  end?: Date
}
