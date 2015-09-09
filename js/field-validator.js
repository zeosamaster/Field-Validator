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

			// attribute names
			names = {
				// tooltips
				tooltip_class: "error-input-tooltip",
				tooltip_added_handler: "tooltip-added"
			},

			// callbacks
			after_validation_callback,

			// alertify
			alertify_defaults = {
				error_delay: 10,
				warning_delay: 5
			},
			$alertify = alertify;

		/*********************/
		/* private functions */
		/*********************/

		// alertify functions

		function alertify_message(message, delay) {
			delay = delay || alertify_defaults.warning_delay;
			$alertify.message(message, delay);
		}

		function alertify_error(error, delay) {
			delay = delay || alertify_defaults.error_delay;
			$alertify.message(error, delay);
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

		function processMessages(elem, messages) {
			var options = getElemFieldAttrs(elem),
				i;
			for (i = 0; i < messages.length; i += 1) {
				messages[i] = replaceAll(messages[i], options);
			}
			return messages.filter(function (item, pos, self) {
				return self.indexOf(item) === pos;
			});
		}

		function handleElemErrors(elem, messages) {
			if (messages.length) {
				var message = "";

				if (names.custom_message_attr && elem.attr(names.custom_message_attr)) {
					message = elem.attr(names.custom_message_attr);

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
					.addClass("error-input-highlight")
					.trigger(names.tooltip_added_handler + ".field-validator");

			} else {
				elem.removeAttr("data-tooltip-html")
					.removeClass("error-input-highlight")
					.trigger("tooltip-removed.field-validator");
			}
		}

		/********************/
		/* public functions */
		/********************/

		validator.validate = function (elems) {
			var valid = true;

			elems = (elems && elems.length ? elems : $('[data-field-validations]', $container));
			elems.each(function (i, el) {
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
					label = $('label[for=' + $elem.attr('id') + ']', $container).text() || "";
					$elem.attr("data-field-label", label);
				}

				// add validation types from independent attributes
				if (required) {
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

				// handle validation errors
				messages = processMessages($elem, messages);
				handleElemErrors($elem, messages);

				valid = valid && $valid;
			});

			if (typeof (after_validation_callback) === "function") {
				after_validation_callback(valid, elems);
			}
		};

		validator.setup = function (options) {
			// load validation rules and messages
			$.getScript("js/validations-config.js", function (data) {
				validations = window.validations;
				delete window.validations;
				alertify_message("Setup completed");
			});

			// remove handlers from previous container
			if ($container && $container.length) {
				$container
					.off(".field-validator")
					.tooltip("destroy");
			}

			// set container
			if (options.container) {
				$container = $(options.container);
			} else {
				$container = ($container.length ? $container : $("body"));
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
			if (options.on_change) {
				$container.on("change.field-validator", '[data-field-validations]', function () {
					validator.validate($(this));
				});
			}

			// add validation callback
			if (typeof (options.after_validation_callback) === "function") {
				after_validation_callback = options.after_validation_callback;
			}

			// initialize tooltip
			if (options.tooltip) {
				names.tooltip_class = options.tooltip.tooltip_class || names.tooltip_class;
				names.custom_message_attr = options.tooltip.custom_message_attr || names.custom_message_attr;

				$container.tooltip({
					items: ".error-input-highlight",
					tooltip_class: names.tooltip_class,
					content: function () {
						return $(this).attr("data-tooltip-html");
					}
				});
			}
		};

		return validator;
	}

	/***************/
	/* instantiate */
	/***************/

	$(document).ready(function () {
		window.validator = new FieldValidator();
	});

}());
