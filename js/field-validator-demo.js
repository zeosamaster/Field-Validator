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

	$(document).ready(function () {
		$('.row').append();
		$('.example').find('input').each(function () {
			var inputHtml = $(this).prop('outerHTML');
			if (inputHtml) {
				$(this).closest('.test').before(getCodeContainer(inputHtml));
			}
			$(this).before($('<label />').text("Input"));
		});

		$('.example').each(function () {
			var $btnContainer = validateButton.clone(),
				$validator = new $.FieldValidator();

			$validator.setup({
				container: $(this)
			});

			$btnContainer.find('.btn-validate').click($validator.fullValidate);
			$(this).append($btnContainer);

			$(this).wrap($('<div class="example-container" />'));
		});

	});
}());
