import loadScript from './loadScript.js';

const DOC = window.self.document;

export default (done) => {
	if (!window.Promise) {
		return done();
	}
	loadScript(
		'https://polyfill.io/v3/polyfill.min.js?features=Promise',
		done
	);
};