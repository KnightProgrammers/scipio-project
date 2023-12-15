/**
 * Converts a string to title case.
 *
 * @param {string} str - The input string.
 * @returns {string} The string converted to title case.
 *
 * @example
 * const title = toTitleCase("hello world");
 * console.log(title); // Output: "Hello World"
 *
 * @example
 * const title = toTitleCase("javascript is awesome");
 * console.log(title); // Output: "Javascript Is Awesome"
 */
const toTitleCase = (str) => {
	if (str === null || str === '') return false;
	else str = str.toString();

	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

export default toTitleCase;
