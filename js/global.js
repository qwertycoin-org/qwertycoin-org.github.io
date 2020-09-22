$(document).ready(function() {
	var url = window.location.href;
	var language = url.match(/lang=(.*)/)[1].replace(/#(.*)/,"");
	if(matches !== null && matches.length > 1) {
		$.i18n().locale = language;
		setCookie('lang', language, 10000);
	}
});

jQuery(function($) {
	
	var do_translate = function() {
		$('html').i18n();
	}

	$.i18n().load({
		'ar': './i18n/ar.json',
		'bh': './i18n/bh.json',
		'bn': './i18n/bn.json',
		'de': './i18n/de.json',
		'en': './i18n/en.json',
		'es': './i18n/es.json',
		'fa': './i18n/fa.json',
		'fr': './i18n/fr.json',
		'he': './i18n/he.json',
		'hi': './i18n/hi.json',
		'it': './i18n/it.json',
		'ja': './i18n/ja.json',
		'ko': './i18n/ko.json',
		'ms': './i18n/ms.json',
		'nl': './i18n/nl.json',
		'pa': './i18n/pa.json',
		'pl': './i18n/pl.json',
		'pt': './i18n/pt.json',
		'ru': './i18n/ru.json',
		'ta': './i18n/ta.json',
		'tr': './i18n/tr.json',
		'ur': './i18n/ur.json',
		'vi': './i18n/vi.json',
		'zh': './i18n/zh.json'
	}).done(function() {

		$('.locale-switcher').on('click', 'a', function(e) {
			//e.preventDefault();
			console.log($(this).data('locale'));
			$.i18n().locale = $(this).data('locale');
			setCookie('lang', $(this).data('locale'), 10000);
			do_translate();
		});

		if(getCookie('lang')) {
			$.i18n().locale = getCookie('lang');
		} else {
			$.i18n().locale = 'en';
		}
		do_translate();
	});
});