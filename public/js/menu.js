function scrollToAnchor(aid) {
	var aTag = $("a[name='" + aid + "']");
	$('html,body').animate({ scrollTop: aTag.offset().top }, 'slow');
}

jQuery(function($) {
	$('.sidebar-dropdown > a').click(function() {
		$('.sidebar-submenu').slideUp(200, function() {
			$(this).removeClass('d-block');
		});
		if (
			$(this)
				.parent()
				.hasClass('active')
		) {
			$('.sidebar-dropdown').removeClass('active');
			$(this)
				.parent()
				.removeClass('active');
		} else {
			$('.sidebar-dropdown').removeClass('active');
			$(this)
				.next('.sidebar-submenu')
				.removeClass('d-none')
				.slideDown(200);
			$(this)
				.parent()
				.addClass('active');
		}
	});

	$('.close-sidebar').click(function() {
		$('.page-wrapper').removeClass('toggled');
		$('button.show-sidebar').show();
		$('button.close-sidebar').hide();
		scrollToAnchor('videoAnchor');
	});
	$('.show-sidebar').click(function() {
		$('.page-wrapper').addClass('toggled');
		$('button.show-sidebar').hide();
		$('button.close-sidebar').show();
	});
});
