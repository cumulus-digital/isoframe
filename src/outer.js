import './outer.scss';
import { h, Fragment } from 'Utils/h.js';
import domReady from 'Utils/domReady.js';
import waitForCondition from 'Utils/waitForCondition';

console.log('ISOFRAME v2');

const DOC = window.self.document;
const CURRENT_SCRIPT = DOC.currentScript;

const SCR_URL = new URL(CURRENT_SCRIPT.src);
const SCR_PATH =
	SCR_URL.origin +
	SCR_URL.pathname.substring(0, SCR_URL.pathname.lastIndexOf('/'));

DOC.head.append(
	<link href={`${SCR_PATH}/outer.css`} rel="stylesheet" type="text/css" />
);

// If template used an iframe, then iframes in the template need to use
// a fake iframe tag with a different name.
DOC.createElement('iiframe');

const isoFrame = (TEMPLATE, title = 'Isolated page content') => {
	// el might be a selector
	if (!TEMPLATE?.tagName && typeof TEMPLATE === 'string') {
		TEMPLATE = document.querySelector(TEMPLATE);
	}
	if (!TEMPLATE) {
		throw new Error('Template element not provided to isoFrame');
	}
	/*
	if (TEMPLATE?.tagName.toLowerCase() !== 'iframe') {
		throw new Error('Template must be an iframe.');
	}
	*/

	const id = `${TEMPLATE.id}-isoframe`;

	const TEMPLATE_TITLE =
		TEMPLATE.getAttribute('title') ||
		TEMPLATE.getAttribute('data-title') ||
		false;
	if (TEMPLATE_TITLE) {
		title = TEMPLATE_TITLE;
	}

	domReady(() => {
		console.log('ISOFRAME: Generating isolation iframe', id);
		TEMPLATE.setAttribute('data-isoframe-processed', true);

		const ISOFRAME = (
			<iframe
				id={id}
				name={id}
				title={title}
				frameBorder="0"
				width="100%"
				class="CMLS_CCC_IFRAME isoframe-processed"
				scrolling="no"
				allowTransparency="yes"
				style="width: 100%"
			/>
		);

		let TEMPLATE_CONTENT;
		if (
			TEMPLATE.tagName.toLowerCase() === 'template' &&
			TEMPLATE?.content?.children
		) {
			TEMPLATE_CONTENT = [...TEMPLATE.content.children]
				.map((e) => e.outerHTML)
				.join('\n');
		} else if (TEMPLATE.innerText) {
			TEMPLATE_CONTENT = TEMPLATE.innerText;
		} else {
			TEMPLATE_CONTENT = TEMPLATE.innerHTML;
		}
		if (TEMPLATE_CONTENT.indexOf('<!DOCTYPE') < 0) {
			TEMPLATE_CONTENT = '<!DOCTYPE html>\n' + TEMPLATE_CONTENT;
		}

		// Replace any "iiframe"s with real iframe
		TEMPLATE_CONTENT = TEMPLATE_CONTENT.replace(/<iiframe/g, '<iframe');

		var parser = new DOMParser();
		var TEMPLATE_DOC = parser.parseFromString(
			TEMPLATE_CONTENT,
			'text/html'
		);

		// Use template's title tag if possible
		const TEMPLATE_TITLE = TEMPLATE_DOC.querySelector('title');
		if (TEMPLATE_TITLE) {
			title = TEMPLATE_TITLE.innerText;
			ISOFRAME.setAttribute('title', title);
		}

		// Ensure base target
		if (
			!TEMPLATE.getAttribute('no-base-target') &&
			!TEMPLATE_DOC.querySelector('base[target]')
		) {
			TEMPLATE_DOC.head.append(<base target="_parent" />);
		}

		// Ensure charset
		if (!TEMPLATE_DOC.querySelector('meta[charset]')) {
			TEMPLATE_DOC.head.append(<meta charset="UTF-8" />);
		}

		// Ensure viewport
		if (!TEMPLATE_DOC.querySelector('meta[name="viewport"]')) {
			TEMPLATE_DOC.head.append(
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1.0"
				/>
			);
		}

		// Ensure x-ua-compatible
		if (!TEMPLATE_DOC.querySelector('meta[http-equiv="x-ua-compatible"]')) {
			TEMPLATE_DOC.head.append(
				<meta http-equiv="x-ua-compatible" content="ie=edge" />
			);
		}

		// Ensure jquery is in template content
		if (
			!TEMPLATE.getAttribute('no-inner-jquery') &&
			!TEMPLATE_DOC.querySelector(
				'script[src*="jquery.min.js"],script[src*="jquery.js"]'
			)
		) {
			console.log('ISOFRAME: Injecting jQuery');
			TEMPLATE_DOC.head.append(
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

		// ensure inner.js is in frame
		const INNER_SCR = `${SCR_PATH}/inner.js`;
		if (
			!TEMPLATE.getAttribute('no-inner-js') &&
			!TEMPLATE_DOC.querySelector(`script[src="${INNER_SCR}"]`)
		) {
			console.log('ISOFRAME: Injecting inner script');
			TEMPLATE_DOC.head.append(<script src={INNER_SCR} async={true} />);
		}

		// Ensure inner.css is in frame
		const INNER_CSS = `${SCR_PATH}/inner.css`;
		if (
			!TEMPLATE.getAttribute('no-inner-css') &&
			!TEMPLATE_DOC.querySelector(`link[href*="${INNER_CSS}"]`)
		) {
			TEMPLATE_DOC.head.append(
				<link rel="stylesheet" type="text/css" href={INNER_CSS} />
			);
		}

		// Ensure GPT is available inside iframe
		const PARENT_GPT = DOC.querySelector('script[src*="gpt.js"]');
		if (
			!TEMPLATE.getAttribute('no-gpt') &&
			!TEMPLATE_DOC.querySelector('script[src*="gpt.js"]') &&
			PARENT_GPT
		) {
			waitForCondition(() => ISOFRAME?.contentDocument?.head).then(() => {
				window.self.googletag = window.self.googletag || {};
				window.self.googletag.cmd = window.self.googletag.cmd || [];
				window.self.googletag.cmd.push(() => {
					ISOFRAME.contentDocument.head.append(
						<script
							src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
							async={true}
						/>
					);
				});
			});
		}

		// Ensure iFrameResizer content script is in template
		if (
			!TEMPLATE_DOC.querySelector(
				'script[src*="iframeResizer.contentWindow"]'
			)
		) {
			TEMPLATE_DOC.head.append(
				<script
					src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.11/js/iframeResizer.contentWindow.js"
					async={true}
				/>
			);
		}

		const HAS_TAGGED_EL = !!TEMPLATE_DOC.querySelector(
			'[data-iframe-height]'
		);

		TEMPLATE.after(ISOFRAME);
		const IDOC = ISOFRAME.contentDocument;
		IDOC.open();
		IDOC.write([...TEMPLATE_DOC.children].map((e) => e.outerHTML));
		IDOC.close();
		TEMPLATE.remove();

		// Set up iFrameResizer
		DOC.body.append();
		const init_ifr = () => {
			const ifr_options = {
				//log: true,
				checkOrigin: false,
				//sizeWidth: false,
				//tolerance: 0,
				//minSize: 100,
				heightCalculationMethod: HAS_TAGGED_EL
					? 'taggedElement'
					: 'bodyOffset',
				onInit: function (ifr) {
					const ev = new Event('cmls-ifr-init');
					ifr.dispatchEvent(ev);
					DOC.dispatchEvent(ev);
				},
			};
			window.top.console.log(
				'ISOFRAME: Initializing iFrameResize',
				id,
				ifr_options
			);
			window.self.iFrameResize(ifr_options, '#' + id);
			// Force size refresh when window loads
			window.self.addEventListener('load', () => {
				if ('parentIFrame' in window.self) {
					window.self.parentIFrame.size();
				}
			});
		};

		if (!DOC.querySelector('script[src*="iframe-resizer"]')) {
			console.log('ISOFRAME: Injecting iFrameResizer script');
			DOC.body.append(
				<script
					src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.11/js/iframeResizer.min.js"
					async
					onload={() => {
						init_ifr();
					}}
				></script>
			);
		} else {
			console.log(
				'ISOFRAME: iFrameResizer script already loaded, waiting for init.',
				window.self.iFrameResize
			);
			waitForCondition(() => window.self.iFrameResize, 5000, 100)
				.then(() => init_ifr())
				.catch(() =>
					console.log('Timed out waiting for iFrameResizer')
				);
		}
	});
};

window._CMLS = window._CMLS || {};
window._CMLS.isoFrame = isoFrame;

domReady(() => {
	const isoTemplates = DOC.querySelectorAll('.isoframe-template');
	if (isoTemplates && isoTemplates.length) {
		[...isoTemplates].forEach((TEMPLATE) => {
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
			isoFrame(TEMPLATE);
		});
	}
});
