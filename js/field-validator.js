/*global alertify:false, $:false, console:false */

(function () {
	'use strict';

	function FieldValidator() {

		/**********************/
		/* private properties */
		/**********************/

		var
			validator = {},
			validations = {},
			$container,
			options = {},

			// default options
			default_options = {
				container: $("body"),
				delegate_validations: true,
				validate_on_change: true,
				after_validation_callback: undefined,
				tooltip: {
					tooltip_class: "",
					custom_message_attr: "",
					add_handler: undefined,
					remove_handler: undefined,
					position: {
						my: "right-20px"
					}
				},
				alertify: {
					error_delay: 10,
					message_delay: 5,
					max_messages: 5,
					error_class: "alertify-error",
					message_class: "alertify-message"
				}
			},

			// callbacks
			after_validation_callback,

			// alertify
			$alertify = $.extend({}, alertify);

		/*********************/
		/* private functions */
		/*********************/

		// alertify functions

		function alertify_message(message, add_class, delay) {
			delay = delay || options.alertify.message_delay;
			add_class = add_class || options.alertify.message_class;

			var instance = $alertify.message(message, delay);
			if (add_class && instance.element) {
				$(instance.element).addClass(add_class);
			}
			return instance;
		}

		function alertify_error(error, add_class, delay) {
			delay = delay || options.alertify.error_delay;
			add_class = add_class || options.alertify.error_class;

			var instance = $alertify.error(error, delay);
			if (add_class && instance.element) {
				$(instance.element).addClass(add_class);
			}
			return instance;
		}

		function showAlertifyErrors(error, add_class, delay) {
			var instance = $alertify.validation_errors_instance;
			if (instance) {
				instance
					.delay(options.alertify.error_delay)
					.setContent(error);
			} else {
				instance = alertify_error(error, add_class, delay);
				instance.callback = function () {
					delete $alertify.validation_errors_instance;
					return true;
				};
				$alertify.validation_errors_instance = instance;
			}
		}

		// utils

		function getElemFieldAttrs(elem) {
			var options = {};
			$.each(elem[0].attributes, function (index, attr) {
				if (attr && attr.name && attr.name.indexOf("data-field-") > -1) {
					options[attr.name] = attr.value;
				}
			});
			return options;
		}

		function getValidationTypes(input) {
			var validation_types = (typeof (input) === "string" ? input : $(input).attr("data-field-validations"));
			if (validation_types.length) {
				return validation_types.toLowerCase().split(/[,;\s]+/g);
			} else {
				return [];
			}
		}

		function replaceAll(text, options) {
			var prop, regex, field;
			for (prop in options) {
				if (options.hasOwnProperty(prop)) {
					field = options[prop];
					regex = new RegExp("#" + prop, "g");
					text = text.replace(regex, field);
				}
			}
			return text;
		}

		// validation error handling

		function replaceMessagePlaceholders(elem, messages) {
			var options = getElemFieldAttrs(elem),
				i;
			for (i = 0; i < messages.length; i += 1) {
				messages[i] = replaceAll(messages[i], options);
			}
			return messages.filter(function (item, pos, self) {
				return self.indexOf(item) === pos;
			});
		}

		function handleTooltipErrors(elem, messages) {
			if (messages.length) {
				var message = "";

				if (options.tooltip.custom_message_attr && elem.attr(options.tooltip.custom_message_attr)) {
					return;

				} else if (messages.length > 1) {
					message = "<span>O campo";
					message += (elem.attr("data-field-label") ? " \"" + elem.attr("data-field-label") + "\"" : "");
					message += "</span>";
					message += "<ul><li>" + messages.join("</li><li>") + "</li></ul> ";

				} else if (messages.length === 1) {
					message = "<span>O campo";
					message += (elem.attr("data-field-label") ? " \"" + elem.attr("data-field-label") + "\"" : "");
					message += " " + messages[0] + "</span>";
				}

				elem.attr("data-tooltip-html", message)
					.addClass("has-tooltip");
				if (options.tooltip && options.tooltip.add_handler) {
					options.tooltip.add_handler(elem, message);
				}

			} else {
				elem.removeAttr("data-tooltip-html")
					.removeClass("has-tooltip");
				if (options.tooltip && options.tooltip.remove_handler) {
					options.tooltip.remove_handler(elem);
				}
			}
		}

		function handleAlertifyErrors(messages) {
			var alertify_html = "";
			messages.slice(0, options.alertify.max_messages).forEach(function (message) {
				alertify_html +=
					"<p>" +
					"<b>" + message.label + "</b>" + ": " +
					message.message +
					"</p>";
			});
			if (messages.length > options.alertify.max_messages) {
				alertify_html += "<p><b>...</b></p>";
			}
			return alertify_html;
		}

		/********************/
		/* public functions */
		/********************/

		validator.fullValidate = function () {
			var outputs = [],
				alertify_html;

			$('[data-field-validations]', $container).each(function () {
				outputs = outputs.concat(validator.validate($(this)));
			});

			if (outputs.length) {
				alertify_html = handleAlertifyErrors(outputs);
				showAlertifyErrors(alertify_html, "validation-errors-alertify");
			} else {
				$alertify.success("Validations successfull");
			}
		};

		validator.validate = function (elems) {
			var $elems = $(elems),
				valid = true,
				validation_output = [];

			$elems.each(function (i, el) {
				var $elem = $(el),
					label = $elem.attr("data-field-label"),
					types = [],
					required = $elem.attr("data-field-required"),
					regex = $elem.attr("data-field-regex"),
					min = $elem.attr("data-field-min-length"),
					max = $elem.attr("data-field-max-length"),
					html_types = getValidationTypes($elem),
					messages = [],
					$valid = true;

				if (!label) {
					label = $('label[for=' + $elem.attr('id') + ']', $container).text() || $elem.prevAll('label').first().text() || "";
					$elem.attr("data-field-label", label);
				}

				// add validation types from independent attributes
				if (required !== undefined) {
					types.push("required");
				}
				if (regex) {
					types.push("regex");
				}
				if (min || max) {
					types.push("length");
				}

				html_types.forEach(function (type) {
					if (types.indexOf(type) < 0) {
						types.push(type);
					}
				});

				// validate input according to its validation types
				types.forEach(function (type) {
					var type_messages = validations[type].validation_function($elem);
					if (type_messages.length) {
						$valid = false;
						messages = messages.concat(type_messages);
					}
				});

				messages = replaceMessagePlaceholders($elem, messages);
				handleTooltipErrors($elem, messages);

				messages.forEach(function (message) {
					validation_output.push({
						label: label,
						message: message
					});
				});

				valid = valid && $valid;
			});

			if (typeof (after_validation_callback) === "function") {
				after_validation_callback(valid, $elems);
			}

			return validation_output;
		};

		validator.setup = function (setup_options) {
			// load validation rules and messages
			$.getScript("js/validations-config.js", function (data) {
				validations = window.validations;
				delete window.validations;
			});

			// remove handlers from previous container
			if ($container) {
				$container.off(".field-validator");
				if ($container.data('ui-tooltip')) {
					$container.tooltip("destroy");
				}
			}

			// fill empty options with default
			options = $.extend(default_options, setup_options);

			// set container
			if (options.container) {
				$container = $(options.container);
			}

			// delegate parent validations to children
			if (options.delegate_validations) {
				$('[data-field-validations]', $container).not('input').each(function (i, elem) {
					var $parent = $(elem),
						children = $('input', $parent),
						parent_validations = getValidationTypes($parent),
						parent_attrs = [],
						field_attrs = [],
						attr;

					// merge child validation types with parent validation types
					children.each(function (index, child) {
						var $child = $(child),
							child_validations = getValidationTypes($child),
							filtered_parent_validations = [],
							merged_validations = [];

						filtered_parent_validations = parent_validations.filter(function (parent_validation) {
							return child_validations.indexOf(parent_validation) < 0;
						});
						if (!filtered_parent_validations.length) {
							return true;
						}

						merged_validations = child_validations.concat(filtered_parent_validations);
						if (!merged_validations.length) {
							return true;
						}

						$child.attr("data-field-validations", merged_validations.join(" "));
					});
					$parent.removeAttr("data-field-validations");

					// fill child validation attributes with parent validation attributes when empty,
					parent_attrs = getElemFieldAttrs($parent);
					for (attr in parent_attrs) {
						if (parent_attrs.hasOwnProperty(attr)) {
							field_attrs.push({
								name: attr,
								value: parent_attrs[attr]
							});
						}
					}
					field_attrs.forEach(function (attr) {
						$(children).not('[' + attr.name + ']').each(function (index, child) {
							$(child).attr(attr.name, attr.value);
						});
						$parent.removeAttr(attr.name);
					});
				});
			}

			// add change handler
			if (options.validate_on_change) {
				$container.on("change.field-validator", '[data-field-validations]', function () {
					validator.validate($(this));
					if ($alertify.validation_errors_instance) {
						$alertify.validation_errors_instance.dismiss();
					}
				});
			}

			// add validation callback
			if (typeof (options.after_validation_callback) === "function") {
				after_validation_callback = options.after_validation_callback;
			}

			// initialize tooltip
			if (options.tooltip) {
				$container.tooltip({
					items: ".has-tooltip",
					tooltip_class: options.tooltip.tooltip_class,
					content: function () {
						return $(this).attr(options.tooltip.custom_message_attr) || $(this).attr("data-tooltip-html");
					},
					position: options.tooltip.position
				});
				$('[role="log"]').remove();
			}
		};

		return validator;
	}

	/***************/
	/* instantiate */
	/***************/

	$(document).ready(function () {
		$.FieldValidator = FieldValidator;
	});

}());
