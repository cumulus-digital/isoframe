import './outer.scss';
import loadScript from 'Utils/loadScript.js';
import PromisePolyfill from 'Utils/PromisePolyfill.js';
import domReady from 'Utils/domReady.js';

const DOC = window.self.document;

window._CMLS = window._CMLS || {};
if (!window._CMLS.isoFrame) {
	window._CMLS.isoFrame = (id, title = '') => {
		const isoFrameId = `${id}-isoFrame`;

		const main = () => {
			const Promise = window.Promise;

			domReady(() => {
				const TEMPLATE = DOC.querySelector(`#${id}`);
				if (!TEMPLATE) {
					console.error(`No template found with supplied ID: ${id}`);
					return;
				}
				if (TEMPLATE.tagName.toLowerCase() !== 'iframe') {
					console.error(`Supplied template is not an iframe: ${id}`);
					return;
				}

				TEMPLATE.setAttribute('data-isotemplate', 'tempalte');
				TEMPLATE.isoTemplate = true;

				const ISOFRAME = DOC.createElement('iframe');
				let isoAttrs = {
					id: isoFrameId,
					name: isoFrameId,
					frameBorder: 0,
					width: '100%',
					class: 'CMLS_CCC_IFRAME',
					scrolling: false,
					allowTransparency: true,
					style: 'width: 100%',
				};
				for (const a in isoAttrs) {
					ISOFRAME.setAttribute(a, isoAttrs[a]);
				}

				const TEMPLATE_CONTENT = TEMPLATE.innerText;
				const HAS_TAGGED_EL =
					TEMPLATE_CONTENT.indexOf('data-iframe-height') > -1;

				if (!!('srcdoc' in ISOFRAME)) {
					ISOFRAME.srcdoc = TEMPLATE_CONTENT;
					TEMPLATE.parentNode.insertBefore(ISOFRAME, TEMPLATE);
				} else {
					DOC.insertBefore(TEMPLATE, ISOFRAME);
					const ISOFRAME_DOC = ISOFRAME.contentDocument;
					ISOFRAME_DOC.open();
					ISOFRAME_DOC.write(TEMPLATE_CONTENT);
					ISOFRAME_DOC.close();
				}
				TEMPLATE.parentNode.removeChild(TEMPLATE);

				// Set up iFrameResizer
				function setupIframeResizer() {
					DOC.defaultView.iFrameResize(
						{
							checkOrigin: false,
							sizeWidth: false,
							tolerance: 10,
							minSize: 100,
							heightCalculationMethod: HAS_TAGGED_EL
								? 'taggedElement'
								: 'bodyOffset',
							onInit: function (ifr) {
								const ev = new Event('cmls-ifr-init');
								ifr.dispatchEvent(ev);
								DOC.dispatchEvent(ev);
							},
						},
						`#${isoFrameId}`
					);
				}
				if (!DOC.defaultView.iFrameResize) {
					loadScript(
						'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.2/iframeResizer.min.js',
						function () {
							setupIframeResizer();
						}
					);
				} else {
					setupIframeResizer();
				}
			});
		};
		PromisePolyfill(main);
	};
}

domReady(function () {
	const isoTemplates = DOC.querySelectorAll('.isoframe-template');
	if (isoTemplates && isoTemplates.length) {
		[].forEach.call(isoTemplates, (TEMPLATE) => {
			if (
				TEMPLATE.isoTemplate ||
				TEMPLATE.getAttribute('data-isotemplate')
			) {
				return;
			}
			if (!TEMPLATE.getAttribute('id')) {
				const r = (Math.random() + 1).toString(36).substring(2);
				TEMPLATE.setAttribute('id', `isoTemplate-${r}`);
			}
			window._CMLS.isoFrame(TEMPLATE.getAttribute('id'));
		});
	}
});
