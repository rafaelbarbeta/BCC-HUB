/*---------------------------------------------------------------------
    File Name: custom.js
---------------------------------------------------------------------*/

$(function () {

	"use strict";

	/* Preloader
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

	setTimeout(function () {
		$('.loader_bg').fadeToggle();
	}, 1500);

	/* OWL Carousel SITES */
	$(document).ready(function(){
		$('.owl-carousel').owlCarousel({
			items: 1, // Número de itens visíveis por vez
			loop: true, // Repetir o carrossel
			margin: 0, // Margem entre os itens
			autoplay: true, // Autoplay
			autoplayTimeout: 4500, // Tempo entre os slides em milissegundos
			autoplayHoverPause: true // Pausar o autoplay quando o mouse estiver sobre o carrossel
		});
	});

});

/* change sites div a img images for mobile */
var last_window_size = $(window).width();
$(document).ready(function() {
    $(window).trigger('resize');
	if ($(window).width() < 575) {
		$('.sites div a img').each(function(){
			var x = $(this).attr('src').replace('desktop', 'mobile');
			$(this).attr('src', x);
		});
	}
	else {
		$('.sites div a img').each(function(){
			var x = $(this).attr('src').replace('mobile', 'desktop');
			$(this).attr('src', x);
		});
	}
});

$(window).resize(function(){
	if (Math.abs(last_window_size - $(window).width()) > 50) {
		if ($(window).width() < 575) {
			$('.sites div a img').each(function(){
				var x = $(this).attr('src').replace('desktop', 'mobile');
				$(this).attr('src', x);
			});
		}
		else {
			$('.sites div a img').each(function(){
				var x = $(this).attr('src').replace('mobile', 'desktop');
				$(this).attr('src', x);
			});
		}
		last_window_size = $(window).width();
	}
});
