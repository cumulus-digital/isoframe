import { h, Fragment } from 'Utils/h.js';

const DOC = window.self.document;

export default (done) => {
	if (window.self.Promise) {
		return done();
	}
	DOC.body.append(
		<script
			src="https://polyfill.io/v3/polyfill.min.js?features=Promise"
			async
			onLoad={done}
		/>
	);
};
