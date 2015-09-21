/*global $:false, console:false */
(function () {
	'use strict';
	var
		validateButton =
		$('<div class="btn-group"/>').append(
			$('<div class="right"/>').append(
				$('<button />', {
					"class": "btn btn-default btn-validate",
					"text": "Validate"
				})
			)
		),

		getCodeContainer = function (code) {
			return $('<div class="code-container" />').append(
				$('<pre class="code" />').text(code)
			);
		};


	function insertCode(i, elem) {
		var inputHtml = $(elem).prop('outerHTML');
		if (inputHtml) {
			$(elem).closest('.test.types').before(getCodeContainer(inputHtml));
		}
		$(elem).before($('<label />').text("Input"));
	}

	function keepNavBar() {
		if ($(window).scrollTop() > 20) {
			$('.menu').addClass('fixed');
		} else {
			$('.menu').removeClass('fixed');
		}
	}

	function setupSingleExample(i, elem) {
		var $btnContainer = validateButton.clone(),
			$validator = new $.FieldValidator();

		$validator.setup({
			container: $(elem)
		});

		$btnContainer.find('.btn-validate').click($validator.fullValidate);
		$(elem).append($btnContainer);

		$(elem).wrap($('<div class="example-container" />'));
	}

	function slideElem(siblings, elem, offset) {
		$(siblings).slideUp().promise().done(function () {
			$(elem).slideDown(function () {
				$('body').animate({
					scrollTop: $(elem).offset().top + (offset || 0)
				}, 500);
			});
		});
	}

	function slidePage(name) {
		slideElem('[page]', $('[page="' + name + '"]'), -75);
	}

	function slideHandler(e) {
		var target = $(e.target),
			target_page = target.attr('href');

		$('.menu li').removeClass('active');
		target.closest('li').addClass('active');

		if (window.location.hash !== target_page) {
			slidePage(target_page);
		}
	}

	$(document).ready(function () {
		$('.example')
			.each(setupSingleExample)
			.find('input').each(insertCode);

		$('.menu').on('click.demo', '.slider', slideHandler);

		slidePage(window.location.hash);

		$(window).bind('scroll', keepNavBar);
	});
}());
