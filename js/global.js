jQuery(function($) {
	
	var do_translate = function() {
		$('html').i18n();
	}

	$.i18n().load({
		'en': './i18n/en.json',
		'de': './i18n/de.json',
		'cn': './i18n/cn.json'
	}).done(function() {

		$('.locale-switcher').on('click', 'a', function(e) {
			e.preventDefault();
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