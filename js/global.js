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
			do_translate();
		});

		do_translate();
	});
});