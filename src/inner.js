import './inner.scss';
import { h, Fragment } from 'Utils/h.js';
import domReady from 'Utils/domReady.js';
import waitForCondition from 'Utils/waitForCondition';

const DOC = window.self.document;
const parentWindow = DOC.defaultView.parent;

const main = () => {
	window.self.INIT_GPT = (networkId) => {
		if (!networkId) {
			throw new Error(
				'ISOFRAME: Attempted to call INIT_GPT without a network ID'
			);
			return;
		}

		// Overwrite INIT_GPT so it can only be called successfully once.
		window.self.INIT_GPT = () => {};

		window.self.googletag = window.self.googletag || {};
		window.self.googletag.cmd = window.self.googletag.cmd || [];
		window.self.googletag.cmd.push(() => {
			const parent_googletag = window.self.parent.googletag;
			if (!parent_googletag) {
				throw new Error('Could not retrieve parent googletag!');
			}

			let adPath = null;
			const slots = parent_googletag.pubads().getSlots();
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
				throw new Error(
					'ISOFRAME: Could not determine parent adPath, exiting GPT activation.'
				);
				return;
			}

			console.log('ISOFRAME: Adpath found', adPath);
			window.GPT_SITE_ID = adPath;

			const targetingKeys = parent_googletag.pubads().getTargetingKeys();
			if (targetingKeys?.length) {
				console.log(
					'ISOFRAME: Found parent page-level targeting',
					targetingKeys
				);
				targetingKeys.forEach((key) => {
					const t = parent_googletag.pubads().getTargeting(key);
					console.log('ISOFRAME: Setting ' + key + ': ' + t);
					window.self.googletag.pubads().setTargeting(key, t);
				});
			} else {
				console.log(
					'ISOFRAME: No parent page-level targeting keys found.'
				);
			}

			window.self.googletag.pubads().enableSingleRequest();
			window.self.googletag.enableServices();
		});
	};
};
main();

// Handle Twitter embeds
domReady(() => {
	if (
		document.querySelector('.twitter-tweet,.twitter-timeline') &&
		!document.querySelector(
			'script[src*="platform.twitter.com/widgets.js"]'
		)
	) {
		window.self.twttr = (function (d, s, id) {
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
});

// Handle Facebook embeds
domReady(() => {
	if (
		document.querySelector('.fb-page,.fb-video') &&
		!document.querySelector(
			'script[src*="https://connect.facebook.net/en_US/sdk.js"]'
		)
	) {
		document.body.append(
			<>
				<div id="fb-root"></div>
				<script
					async
					defer
					crossorigin="anonymous"
					src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"
					nonce="VHFIi8TO"
				></script>
			</>
		);
	}
});

// Handle BandsInTown embeds
domReady(() => {
	if (
		document.querySelector(
			'a[href*="bandsintown.com"],a.bit-widget-initializer'
		) &&
		!document.querySelector(
			'script[src*="https://widget.bandsintown.com/main.min.js"]'
		)
	) {
		document.body.append(
			<script
				src="https://widget.bandsintown.com/main.min.js"
				async
				defer
				crossorigin="anonymous"
			/>
		);
	}
});
