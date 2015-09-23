/*global $:false, console:false */
(function () {
	'use strict';
	var validateButton =
		$('<div class="btn-group"/>').append(
			$('<div class="right"/>').append(
				$('<button />', {
					"class": "btn btn-default btn-validate",
					"text": "Validate"
				})
			)
		);

	function getCodeContainer(code) {
		return $('<div class="code-container" />').append(
			$('<pre class="code" />').text(code)
		);
	}

	function insertCode(i, elem) {
		var inputHtml = $(elem).prop('outerHTML');
		if (inputHtml) {
			$(elem).closest('.test.types').before(getCodeContainer(inputHtml));
		}
		$(elem).before($('<label />').text("Input"));
	}

	function keepNavBar() {
		if ($(window).scrollTop() > 50) {
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

	function indentPreTag(i, tag) {
		var text = $(tag).html(),
			surplus_spaces,
			regex;

		surplus_spaces = text.match(/^\s+/);
		if (surplus_spaces) {
			regex = new RegExp(surplus_spaces[0], "g");
			text = text.replace(regex, "").replace(/\t/g, "    ");
			$(tag).text(text);
		}
	}

	$(document).ready(function () {
		$('.examples-page .example')
			.each(setupSingleExample)
			.find('input').each(insertCode);

		$('.example').wrap($('<div class="example-container" />'));

		$('.menu').on('click.demo', '.slider', slideHandler);

		slidePage(window.location.hash);

		$(window).bind('scroll', keepNavBar);

		$('pre').each(indentPreTag);
	});
}());
