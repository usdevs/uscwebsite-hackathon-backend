import axios, { AxiosError } from 'axios'

// Revalidates Folio submissions after a successful response
export const revalidateFolioFrontendSubmissions = async (
  submissionId?: number
) => {
  if (!process.env.FRONTEND_REVALIDATE_SECRET) {
    console.error('FRONTEND_REVALIDATE_SECRET not set')
    return
  }

  try {
    const revalidateEndpoint = `http://localhost:3001/api/folio/revalidate`
    const payload = { id: submissionId }

    const response = await axios.post(revalidateEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        secret: process.env.FRONTEND_REVALIDATE_SECRET || '',
      },
    })

    if (response.data.revalidated) {
      console.log('Revalidation successful')
    } else {
      console.log('Revalidation failed')
    }
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Error during revalidation:', axiosError)
  }
}
