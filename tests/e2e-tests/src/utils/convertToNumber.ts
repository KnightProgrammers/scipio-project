export function convertToNumber(currency: string) {
	const regex: RegExp = /[^\d.-]/g;
	let text:string = currency;
	if (currency[currency.length - 3] === ',') {
		text = currency.replace(',', '.')
	}
	return parseFloat(text.replace(regex, ''));
}
