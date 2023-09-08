export default function currencyFormat(
    amount: number,
    currency = 'UYU'
): string {
    const formatter = new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency,
    })
    return formatter.format(amount)
}
