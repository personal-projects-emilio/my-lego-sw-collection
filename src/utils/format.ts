export const formatFrEuroCurrency = new Intl.NumberFormat('fr-Fr', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
}).format
