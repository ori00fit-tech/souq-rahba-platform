export function formatMoney(amount, currency = 'MAD', locale = 'fr-MA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
