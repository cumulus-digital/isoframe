const DOC = window.self.document;

export default (src, done, async = true) => {
	const js = DOC.createElement('script');
	js.src = src;
	js.async = async;
	js.onload = () => done();
	js.onerror = () => done(new Error(`Failed to load script: ${scr}`));
	DOC.head.appendChild(js);
};