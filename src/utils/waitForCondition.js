/**
 * Returns a promise to wait for a check condition to return true.
 *
 * @param {function} check
 * @param {number} timeout
 * @param {number} interval
 */
export default function waitForCondition(
	check = (r) => typeof r !== 'undefined',
	timeout = 10000,
	interval = 50
) {
	const start = Date.now();

	function waiting(resolve, reject) {
		const checked = check();
		if (checked) {
			if (checked === 'CANCEL_WAIT') {
				return;
			}
			resolve(checked);
		} else if (Date.now() - start >= timeout) {
			reject(new Error('Timed out waiting for ref'));
		} else {
			setTimeout(waiting.bind(this, resolve, reject), interval);
		}
	}
	return new Promise(waiting);
}
