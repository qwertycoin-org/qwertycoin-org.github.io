var setCookie = function(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

var getCookie = function(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

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