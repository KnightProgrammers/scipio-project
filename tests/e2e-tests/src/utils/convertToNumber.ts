export function convertToNumber(currency: string) {
	return parseFloat(currency.replace(/[^\d.-]/g, ''));
}
