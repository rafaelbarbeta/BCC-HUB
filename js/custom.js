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
			autoplayTimeout: 1500, // Tempo entre os slides em milissegundos
			autoplayHoverPause: true // Pausar o autoplay quando o mouse estiver sobre o carrossel
		});
	});

});