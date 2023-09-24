export default function currencyFormat(
    amount: number,
    currency = 'UYU',
    lang = 'es',
    country = 'UY',
): string {
    const formatter = new Intl.NumberFormat(`${lang}-${country}`, {
        style: 'currency',
        currency,
    })
    return formatter.format(amount)
}
