import './outer.scss';
import { h, Fragment } from 'Utils/h.js';
import PromisePolyfill from 'Utils/PromisePolyfill.js';
import domReady from 'Utils/domReady.js';
import waitForCondition from 'Utils/waitForCondition';

console.log('ISOFRAME');

const DOC = window.self.document;
const CURRENT_SCRIPT = DOC.currentScript;

const SCR_URL = new URL(CURRENT_SCRIPT.src);
const SCR_PATH =
	SCR_URL.origin +
	SCR_URL.pathname.substring(0, SCR_URL.pathname.lastIndexOf('/'));

DOC.head.append(
	<link href={`${SCR_URL}/outer.css`} rel="stylesheet" type="text/css" />
);

const isoFrame = (TEMPLATE, title = 'Isolated page content') => {
	// el might be a selector
	if (!TEMPLATE?.tagName && typeof TEMPLATE === 'string') {
		TEMPLATE = document.querySelector(TEMPLATE);
	}
	if (!TEMPLATE) {
		throw new Error('Template element not provided to isoFrame');
	}

	const id = `${TEMPLATE.id}-isoframe`;

	const TEMPLATE_TITLE =
		TEMPLATE.getAttribute('title') ||
		TEMPLATE.getAttribute('data-title') ||
		false;
	if (TEMPLATE_TITLE) {
		title = TEMPLATE_TITLE;
	}

	const main = () => {
		const Promise = window.Promise;

		domReady(() => {
			if (!TEMPLATE) {
				throw new Error('Template element not available.');
			}

			TEMPLATE.setAttribute('data-isoframe-processed', true);

			const ISOFRAME = (
				<iframe
					id={id}
					name={id}
					title={title}
					frameBorder="0"
					width="100%"
					class="CMLS_CCC_IFRAME"
					scrolling="no"
					allowTransparency="yes"
					style="width: 100%"
				/>
			);

			const DF = DOC.createRange();
			DF.setStart(DOC.body, 0);

			let TEMPLATE_CONTENT;

			if (
				TEMPLATE?.tagName.toLowerCase() === 'template' &&
				TEMPLATE.content
			) {
				TEMPLATE_CONTENT = TEMPLATE.content.cloneNode(true);
			} else {
				TEMPLATE_CONTENT = DF.createContextualFragment(
					TEMPLATE.innerHTML
				);
			}

			const TEMPLATE_TITLE = TEMPLATE_CONTENT.querySelector('title');
			// Use template's title tag if possible
			if (TEMPLATE_TITLE) {
				ISOFRAME.setAttribute('title', TEMPLATE_TITLE.innerText);
			}

			// Ensure inner.js is in template content
			if (
				!TEMPLATE.getAttribute('no-inner-js') &&
				!TEMPLATE_CONTENT.querySelector(
					`script[src="${SCR_PATH}/inner.js"]`
				)
			) {
				TEMPLATE_CONTENT.prepend(
					<script src={`${SCR_PATH}/inner.js`} />
				);
			}

			// Ensure inner.css is in template content
			if (
				!TEMPLATE.getAttribute('no-inner-css') &&
				!TEMPLATE_CONTENT.querySelector(
					`script[src="${SCR_PATH}/inner.css"]`
				)
			) {
				TEMPLATE_CONTENT.append(
					<link
						href={`${SCR_PATH}/inner.css`}
						rel="stylesheet"
						type="text/css"
					/>
				);
			}

			// Ensure jquery is in template content
			if (
				!TEMPLATE.getAttribute('no-inner-jquery') &&
				!TEMPLATE_CONTENT.querySelector(
					'script[src*="jquery.min.js"],' + 'script[src*="jquery.js"]'
				)
			) {
				TEMPLATE_CONTENT.prepend(
					<script
						src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"
						async={true}
						onLoad={() => {
							const e = new Event('jquery.loaded', {
								bubbles: true,
								cancelable: true,
							});
							window.self.dispatchEvent(e);
						}}
					/>
				);
			}

			// Ensure iframeResizer content script is in template content
			if (
				!TEMPLATE_CONTENT.querySelector(
					'script[src*="iframeResizer.contentWindow.min.js"]'
				)
			) {
				TEMPLATE_CONTENT.append(
					<script
						src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.contentWindow.min.js"
						async={true}
					/>
				);
			}

			// Ensure GPT is available inside iframe
			const PARENT_GPT = DOC.querySelector('script[src*="gpt.js"]');
			if (
				!TEMPLATE.getAttribute('no-gpt') &&
				!TEMPLATE_CONTENT.querySelector('script[src*="gpt.js"]') &&
				window.self?.googletag &&
				PARENT_GPT
			) {
				const CHILD_GPT = PARENT_GPT.cloneNode();
				CHILD_GPT.setAttribute('async', true);
				TEMPLATE_CONTENT.prepend(CHILD_GPT);
			}

			// Inject our isoFrame
			TEMPLATE.after(ISOFRAME);
			const ISOFRAME_DOC = ISOFRAME.contentDocument;
			ISOFRAME_DOC.open();
			ISOFRAME_DOC.write('<!DOCTYPE html>');
			[...TEMPLATE_CONTENT.children].forEach((child) => {
				ISOFRAME_DOC.write(child.outerHTML);
			});
			ISOFRAME_DOC.close();

			const ISOFRAME_HEAD = ISOFRAME_DOC.querySelector('head');

			// Ensure base target
			if (
				!TEMPLATE.getAttribute('no-base-target') &&
				!ISOFRAME_DOC.querySelector('base[target]')
			) {
				ISOFRAME_HEAD.append(<base target="_parent" />);
			}

			// Ensure charset
			if (!TEMPLATE_CONTENT.querySelector('meta[charset]')) {
				ISOFRAME_HEAD.append(<meta charset="UTF-8" />);
			}

			// Ensure viewport
			if (!TEMPLATE_CONTENT.querySelector('meta[name="viewport"]')) {
				ISOFRAME_HEAD.append(
					<meta
						name="viewport"
						content="width=device-width,initial-scale=1.0"
					/>
				);
			}

			// Ensure x-ua-compatible
			if (
				!TEMPLATE_CONTENT.querySelector(
					'meta[http-equiv="x-ua-compatible"]'
				)
			) {
				ISOFRAME_HEAD.append(
					<meta http-equiv="x-ua-compatible" content="ie=edge" />
				);
			}

			// Set up iframeResizer
			const HAS_TAGGED_EL = TEMPLATE_CONTENT.querySelector([
				'data-iframe-height',
			]);
			const setupIframeResizer = (id) => {
				window.self.iFrameResize(
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
					`#${id}`
				);
			};
			const ifr_src =
				'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js';
			if (!DOC.querySelector(`script[src="${ifr_src}"]`)) {
				DOC.body.append(
					<script
						src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"
						async={true}
					/>
				);
			}
			waitForCondition(() => {
				return window.self.iFrameResize;
			}, 2000).then(
				() => {
					setupIframeResizer(id);
				},
				() => {
					console.error('iFrameResizer failed to load.');
					ISOFRAME.setAttribute('height', '1000px');
					ISOFRAME.setAttribute('scrolling', 'yes');
				}
			);

			TEMPLATE.remove();
		});
	};
	PromisePolyfill(main);
};

window._CMLS = window._CMLS || {};
if (!window._CMLS.isoFrame) {
	window._CMLS.isoFrame = isoFrame;
}

domReady(function () {
	const isoTemplates = DOC.querySelectorAll('.isoframe-template');
	if (isoTemplates && isoTemplates.length) {
		[].forEach.call(isoTemplates, (TEMPLATE) => {
			if (
				TEMPLATE.isoTemplate ||
				TEMPLATE.getAttribute('data-isoframe-processed')
			) {
				return;
			}
			if (!TEMPLATE.getAttribute('id')) {
				const r = (Math.random() + 1).toString(36).substring(2);
				TEMPLATE.setAttribute('id', `isoTemplate-${r}`);
			}
			window._CMLS.isoFrame(TEMPLATE);
		});
	}
});
