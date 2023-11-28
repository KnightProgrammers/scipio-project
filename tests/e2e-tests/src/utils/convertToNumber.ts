export function convertToNumber(currency: string) {
	let regex = /[^\d.-]/g;
	if (currency[currency.length - 3] === ',') {
		regex = /[^\d,-]/g;
	}
	return parseFloat(currency.replace(regex, ''));
}
