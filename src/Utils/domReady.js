const DOC = window.self.document;
export default (fn) => {
	if (DOC.readyState !== 'loading') {
		return fn();
	}
	document.addEventListener('DOMContentLoaded', fn);
};
