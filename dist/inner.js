(()=>{"use strict";const e=window.self.document,t=function(t,n){let o=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];const i=e.createElement("script");i.src=t,i.async=o,i.onload=()=>n(),i.onerror=()=>n(new Error(`Failed to load script: ${scr}`)),e.head.appendChild(i)},n=(window.self.document,window.self.document,window.self.document),o=n.defaultView.parent;var i,a,s,r,l,d;n.createElement("iiframe"),(e=>{if(!window.Promise)return e();t("https://polyfill.io/v3/polyfill.min.js?features=Promise",e)})((()=>{const e=window.Promise;n.defaultView.jQueryLoader=()=>new e(((e,o)=>{if(window.hasOwnProperty("jQuery"))return e();t("https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",(function(){const t=new Event("jquery.loaded",{bubbles:!0,cancelable:!0});n.defaultView.dispatchEvent(t),e()}))})),n.defaultView.jQueryLoader().then((()=>{const e=window.jQuery;e((()=>{e("iiframe",n).each((function(){const t=e(this),n=e("<iframe/>"),o=t.prop("attributes");e.each(o,(function(){this.specified&&n.attr(this.name,this.value)})),t.after(n),Object.assign(n[0].dataset,t[0].dataset),t.remove()})),e(n.body).on("load","img,iframe",(function(){n.defaultView.parentIFrame&&n.defaultView.parentIFrame.reset()})),e('a[href*="bandsintown.com"],a.bit-widget-initializer').length&&e.getScript("https://widget.bandsintown.com/main.min.js")}))})),new e(((e,o)=>{if(n.defaultView.hasOwnProperty("parentIFrame"))return e();t("https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.2/iframeResizer.contentWindow.min.js",(function(t){const o=new Event("ifr.loaded",{bubbles:!0,cancelable:!0});n.defaultView.dispatchEvent(o),e()}))}));var i=!1;n.defaultView.INIT_GPT=(t,a)=>{t?i?console.warn("ISOFRAME: INIT_GPT called twice!"):(i=!0,console.log("ISOFRAME: INIT_GPT called.",t,a),(()=>{const t=Date.now(),n=(e,i)=>o?.googletag?.pubads?e(o.googletag):Date.now()-t>=1e4?i(new Error("Timed out waiting for parent GPT")):void setTimeout(n.bind(void 0,e,i),50);return new e(n)})().then((()=>{const e=n.defaultView.googletag||{};e.cmd=e.cmd||[];const i=o.googletag.pubads;let s=null;const r=i()?.getSlots();r.length&&(r.some((e=>{const n=e?.getAdUnitPath();return!(!n||n.indexOf(`/${t}/`)<0||(s=n,0))})),s?(console.log("ISOFRAME: Adpath found",s),targetingKeys=i().getTargetingKeys(),targetingKeys?.length&&e.cmd.push((()=>{console.log("ISOFRAME: Setting page-level targeting keys",targetingKeys),targetingKeys.forEach((t=>{const n=i().getTargeting(t);e.pubads().setTargeting(t,n)}))})),e.cmd.push((function(){console.log("ISOFRAME: Defining slot",s,a);var t=e.defineSlot(s,a,"div-gpt-cube").addService(e.pubads()).setCollapseEmptyDiv(!0).setTargeting("pos","mid");e.pubads().enableSingleRequest(),e.enableServices(),window.self.document.querySelector("#div-gpt-cube")&&(console.log("ISOFRAME: Found slot, calling display."),e.display("div-gpt-cube")),e.pubads().isInitialLoadDisabled()&&(console.log("ISOFRAME: Initial load is disabled, refreshing our slot",t),e.pubads().refresh([t]))})),function(){var e=window.self.document.createElement("script");e.async=!0,e.type="text/javascript",e.src="https://securepubads.g.doubleclick.net/tag/js/gpt.js";var t=window.self.document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}()):console.warn("ISOFRAME: Could not determine parent adPath, exiting GPT activation."))}),(function(e){console.warn("ISOFRAME: Timed out waiting for parent googletag.")}))):console.warn("ISOFRAME: Attempted to call INIT_GPT without a network ID")}})),window.twttr||(window.twttr=(a="script",s="twitter-wjs",l=(i=n).getElementsByTagName(a)[0],d=window.twttr||{},i.getElementById(s)||((r=i.createElement(a)).id=s,r.src="https://platform.twitter.com/widgets.js",l.parentNode.insertBefore(r,l),d._e=[],d.ready=function(e){d._e.push(e)}),d)),function(e,t,n){var o,i=e.getElementsByTagName(t)[0];e.getElementById(n)||((o=e.createElement(t)).id=n,o.src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v14.0",i.parentNode.insertBefore(o,i))}(n,"script","facebook-jssdk")})();