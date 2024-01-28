/**
 * Fire cb when dom is ready, or fire immediately if dom is already ready
 */
const domReady = (cb) => {
	if (window.self.document.readyState !== 'loading') {
		cb();
	} else {
		const doCb = (e) => {
			cb();
			window.self.document.removeEventListener('DOMContentLoaded', cb);
		};
		window.self.document.addEventListener('DOMContentLoaded', doCb, {
			once: true,
		});
	}
};
export default domReady;
