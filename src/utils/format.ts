export const formatFrEuroCurrency = new Intl.NumberFormat('fr-Fr', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
}).format

export const formatPercentage = new Intl.NumberFormat('fr-Fr', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
}).format

// Stored dates are ISO days (YYYY-MM-DD), parsed as UTC midnight: format in UTC so they don't shift a day
const frDateFormat = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' })
export const formatFrDate = (isoDate: string | null) =>
  isoDate ? frDateFormat.format(new Date(isoDate)) : ''
