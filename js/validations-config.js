(function () {
	'use strict';

	var validations = {
		required: {
			message: "é de preenchimento obrigatório",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!value.length) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		regex: {
			message: "contém caracteres inválidos - expressão de validação: #data-field-regex",
			validation_function: function ($elem) {
				var value = $elem.val(),
					regex = $elem.attr("data-field-regex"),
					messages = [];

				if (regex && !new RegExp(regex).test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		min_length: {
			message: "deve ter no mínimo #data-field-min-length caracteres",
			validation_function: function ($elem) {
				var value = $elem.val(),
					min_length = $elem.attr("data-field-min-length"),
					messages = [];

				if (min_length && (!value || value.length < min_length)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		max_length: {
			message: "deve ter no máximo #data-field-max-length caracteres",
			validation_function: function ($elem) {
				var value = $elem.val(),
					max_length = $elem.attr("data-field-max-length"),
					messages = [];

				if (max_length && (!value || value.length > max_length)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		no_spaces: {
			message: "não deve ter espaços",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (/\s/g.test(value)) { // value has spaces
					messages.push(this.message);
				}
				return messages;
			}
		},

		positive: {
			message: "deve conter um número positivo",
			validation_function: function ($elem) {
				var value = $elem.val(),
					aux_value = parseFloat(value),
					messages = [];

				if (aux_value < 0) { // value is not positive
					messages.push(this.message);
				}
				messages = messages.concat(validations.no_spaces.validation_function($elem));
				return messages;
			}
		},

		upper: {
			message: "deve conter apenas letras maiúsculas",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (value.toUpperCase() !== value) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		lower: {
			message: "deve conter apenas letras minúsculas",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (value.toLowerCase() !== value) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		digits: {
			message: "deve conter apenas algarismos de 0 a 9",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/^[0-9]*$/.test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		required_digit: {
			message: "deve conter pelo menos um dígito",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/\d+/.test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		required_lower: {
			message: "deve conter pelo menos um caracter minúsculo",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/[a-z]+/.test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		required_upper: {
			message: "deve conter pelo menos um caracter maiúsculo",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/[A-Z]+/.test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		text: {
			message: "deve conter apenas espaços, letras de A a Z (maiúsculas ou minúsculas) e algarismos de 0 a 9",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/^[a-zA-Z0-9\s]*$/.test(value)) { // value doesn't contain only valid characters
					messages.push(this.message);
				}
				return messages;
			}
		},

		email: {
			message: "deve ter o formato email@email.com",
			validation_function: function ($elem) {
				var value = $elem.val(),
					messages = [];

				if (!/[a-z0-9!#$%&\'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&\'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/i.test(value)) {
					messages.push(this.message);
				}
				return messages;
			}
		},

		integer: {
			not_integer_string_message: "deve conter um número inteiro",
			not_number_message: "deve conter um número inteiro",
			not_integer_message: "deve conter um número inteiro",
			validation_function: function ($elem) {
				var value = $elem.val(),
					aux_value = parseFloat(value),
					no_spaces = validations.no_spaces.validation_function($elem),
					messages = [];

				if (!/^[+\-]?\d+((\.\d+)?e(\+)?\d+)?$/i.test(value.toString())) { // value is not a integer string
					messages.push(this.not_integer_string_message);
				}
				if (typeof aux_value !== "number") { // value is not of type number (includes NaN)
					messages.push(this.not_number_message);
				}
				if (aux_value % 1 !== 0) { // value is not integer (NaN isn't)
					messages.push(this.not_integer_message);
				}
				if (no_spaces.length) {
					messages = messages.concat(no_spaces);
				}
				return messages;
			}
		},

		decimal: {
			not_finite_message: "deve conter um número finito",
			not_a_float_message: "deve conter um valor decimal",
			not_a_number_message: "deve conter um valor decimal",
			validation_function: function ($elem) {
				var value = $elem.val(),
					no_spaces = validations.no_spaces.validation_function($elem),
					messages = [];

				if (!isFinite(value)) { // value is finite
					messages.push(this.not_finite_message);
				}
				if (!/^[+\-]?\d*\.?\d+(e[+\-]?\d+)?$/i.test(value)) { // value is a valid float
					messages.push(this.not_a_float_message);
				}
				if (isNaN(parseFloat(value))) { // value is a number
					messages.push(this.not_a_number_message);
				}
				if (no_spaces.length) {
					messages = messages.concat(no_spaces);
				}
				return messages;
			}
		},

		length: {
			validation_function: function ($elem) {
				var min_length = validations.min_length.validation_function($elem),
					max_length = validations.max_length.validation_function($elem),
					messages = [];

				if (min_length) {
					messages = messages.concat(min_length);
				}
				if (max_length) {
					messages = messages.concat(max_length);
				}
				return messages;
			}
		},

		password: {
			validation_function: function ($elem) {
				var digit = validations.required_digit.validation_function($elem),
					lower = validations.required_lower.validation_function($elem),
					upper = validations.required_upper.validation_function($elem),
					messages = [];

				if (digit.length) {
					messages = messages.concat(digit);
				}
				if (lower.length) {
					messages = messages.concat(lower);
				}
				if (upper.length) {
					messages = messages.concat(upper);
				}
				return messages;
			}
		}
	};

	window.validations = validations;

}());
