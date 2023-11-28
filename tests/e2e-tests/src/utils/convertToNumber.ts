export function convertToNumber(currency: string) {
	return Number(currency.replace('.', '').replace(',', '.').replace(/[^0-9.-]+/g,''));
}
