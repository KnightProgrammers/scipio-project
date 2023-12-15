/**
 * Delays the execution of a function by a specified time.
 *
 * @async
 * @param {number} t - The time, in milliseconds, to delay the execution.
 * @returns {Promise} A promise that resolves to the given value after the specified delay.
 */
const delay = async (t) =>
	new Promise((resolve) => setTimeout(resolve, t));

export default delay;
