import './inner.scss';
import loadScript from 'Utils/loadScript.js';
import PromisePolyfill from 'Utils/PromisePolyfill.js';
import domReady from 'Utils/domReady.js';

const DOC = window.self.document;
const parentWindow = DOC.defaultView.parent;

// Identify fake iiframes for older browsers
DOC.createElement('iiframe');

const main = () => {
	const Promise = window.Promise;

	// jQuery loader
	const jqueryLoader = () => {
		return new Promise((resolve, reject) => {
			if (window.hasOwnProperty('jQuery')) {
				return resolve();
			}
			loadScript(
				'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
				function () {
					const loadedEvent = DOC.createEvent('Event');
					loadedEvent.initEvent('jquery.loaded', true, true);
					DOC.defaultView.dispatchEvent(loadedEvent);
					resolve();
				}
			);
		});
	};
	jqueryLoader().then(() => {
		const $ = window.jQuery;

		$(() => {
			// Transform fake iframes
			$('iiframe', DOC).each(function () {
				const $ORIGINAL = $(this);
				const $NEW = $('<iframe/>');
				const attrs = $ORIGINAL.prop('attributes');
				$.each(attrs, function () {
					if (this.specified) {
						$NEW.attr(this.name, this.value);
					}
				});
				$ORIGINAL.after($NEW);
				Object.assign($NEW[0].dataset, $ORIGINAL[0].dataset);
				$ORIGINAL.remove();
			});

			// Load events need to make parent iframe resize
			$(DOC.body).on('load', 'img,iframe', function () {
				if (DOC.defaultView.parentIFrame) {
					DOC.defaultView.parentIFrame.reset();
				}
			});
		});
	});

	const ifrLoader = () => {
		return new Promise((resolve, reject) => {
			if (DOC.defaultView.hasOwnProperty('parentIFrame')) {
				return resolve();
			}
			loadScript(
				'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.2/iframeResizer.contentWindow.min.js',
				function (e) {
					var loadedEvent = DOC.createEvent('Event');
					loadedEvent.initEvent('ifr.loaded', true, true);
					DOC.defaultView.dispatchEvent(loadedEvent);
					resolve();
				}
			);
		});
	};
	ifrLoader();

	// Handle parent GPT if it exists
	const waitForParentGPT = () => {
		const timeout = 10000,
			start = Date.now();
		const waitingForParentGPT = (resolve, reject) => {
			if (parentWindow?.googletag?.pubads) {
				return resolve(parentWindow.googletag);
			} else if (timeout && Date.now() - start >= timeout) {
				return reject(new Error('Timed out waiting for parent GPT'));
			} else {
				setTimeout(waitingForParentGPT.bind(this, resolve, reject), 50);
			}
		};
		return new Promise(waitingForParentGPT);
	};
	DOC.defaultView.INIT_GPT = (networkId, sizes) => {
		if (!networkId) {
			console.warn('Attempted to call INIT_GPT without a network ID');
			return;
		}
		waitForParentGPT().then(
			() => {
				const googletag = DOC.defaultView.googletag || { cmd: [] };
				const g = parentWindow.googletag;
				const gpa = g.pubads;
				let adPath = null;
				let targetingKeys = null;

				// Discover adpath
				const slots = gpa()?.getSlots();
				if (!slots.length) {
					return;
				}
				slots.some((slot) => {
					const p = slot?.getAdUnitPath();
					if (!p || p.indexOf(`/${networkId}/`) < 0) {
						return false;
					}
					adPath = p;
					return true;
				});

				// Make sure we have an adPath
				if (!adPath) {
					console.warn(
						'Could not determine parent adPath, exiting GPT activation.'
					);
					return;
				}

				// Find parent's global targeting keys
				targetingKeys = gpa().getTargetingKeys();
				if (targetingKeys?.length) {
					googletag.cmd.unshift(() => {
						targetingKeys.forEach((key) => {
							const t = gpa().getTargeting(key);
							googletag.pubads().setTargeting(key, t);
						});
					});
				}

				// Set up GPT slot
				googletag.cmd.unshift(() => {
					const slot = googletag
						.defineSlot(adPath, sizes, 'div-gpt-cube')
						.addService(googletag.pubads())
						.setCollapseEmptyDiv(true)
						.setTargeting('pos', 'mid');
					googletag.pubads().enableSingleRequest();
					googletag.enableServices();
				});

				// Finalize GPT setup
				(function () {
					var gads = window.self.document.createElement('script');
					gads.async = true;
					gads.type = 'text/javascript';
					gads.src =
						'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
					var node =
						window.self.document.getElementsByTagName('script')[0];
					node.parentNode.insertBefore(gads, node);
				})();
			},
			function (error) {
				console.warn('Timed out waiting for parent googletag.');
			}
		);
	};
};
PromisePolyfill(main);

/**
 * THIRD PARTY CODE
 */
// Twitter
if (!window.twttr) {
	window.twttr = (function (d, s, id) {
		var js,
			fjs = d.getElementsByTagName(s)[0],
			t = window.twttr || {};
		if (d.getElementById(id)) return t;
		js = d.createElement(s);
		js.id = id;
		js.src = 'https://platform.twitter.com/widgets.js';
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function (f) {
			t._e.push(f);
		};

		return t;
	})(DOC, 'script', 'twitter-wjs');
}

// Facebook
(function (d, s, id) {
	var js,
		fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s);
	js.id = id;
	js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v14.0';
	fjs.parentNode.insertBefore(js, fjs);
})(DOC, 'script', 'facebook-jssdk');
