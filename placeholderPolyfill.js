/**
 * placeholderPolyfill.js 1.0
 *
 * Copyright 2015, Nicolas Bouvrette http://ca.linkedin.com/in/nicolasbouvrette/
 * Released under the WTFPL license - http://www.wtfpl.net/
 *
 * Stand alone polyfill to support placeholders on legacy browsers.
 *
 * Supports:
 *
 *  - Browsers: IE8+ and any other browsers (which will bypass the script when unnecessary).
 *  - HTML: Use of the 'placeholder' attribute on input elements (only after page load).
 *  - CSS: Can be styled along with other standard placeholder styles.
 *
 * Limitations:
 *
 * This script use custom 'onsubmit' events on forms to make sure placeholder values are not submitted by users. This
 * might cause conflicts with other scripts using form 'onsubmit' events but can be easily mitigate by implementing the
 * new 'beforeOnSubmit' and 'afterOnSubmit' events which offer more flexibility than the standard events.
 *
 * Usage:
 *
 * Simply load this script in your HTML code and customize the style to your liking.
 */
var placeholderPolyfill = function() {

    /** @property string - Name of the class used to identify active placeholder polyfills. */
    var placeholderClassName = 'placeholder';

    /**
     * Verify if placeholders attributes are supported.
     *
     * @returns {boolean} - True when placeholders are supported, otherwise false.
     */
    var placeholderIsSupported = function() {
        return ('placeholder' in document.createElement('input'));
    };

    /**
     * Get all input elements with a placeholder attribute.
     *
     * @returns {Array} - An array of all input elements with placeholder attributes.
     */
    var getElementsWithPlaceholders = function() {
        var inputElements = document.getElementsByTagName('input');
        var inputElementsWithPlaceholders = [];

        for (var iterator = 0; iterator < inputElements.length; iterator++) {
            var element = inputElements[iterator];
            if (element.placeholder || element.getAttribute('placeholder')) {
                element.placeholder = (element.placeholder) ? element.placeholder : element.getAttribute('placeholder');
                inputElementsWithPlaceholders.push(element);
            }
        }
        return inputElementsWithPlaceholders;
    };

    /**
     * Polyfill a specified input element.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var polyfill = function(element) {

        activatePlaceholder(element);

        element.onclick = function () {
            onClick(this)
        };
        element.onfocus = function () {
            onFocus(this)
        };
        element.onblur = function () {
            onBlur(this)
        };

        addBeforeOnSubmit(element.form, function(){beforeOnSubmit(element)});
        addAfterOnSubmit(element.form, function(){afterOnSubmit(element)});
        setCustomBeforeAndAfterOnSubmitEvents(element.form);
    };

    /**
     * Polyfill a specified input element of type password.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var polyfillPassword = function(element) {
        if (element.type == 'password') {
            var placeholderElement = document.createElement('input');
            placeholderElement.type = 'text';
            placeholderElement.className = element.className;
            placeholderElement.placeholder = element.placeholder;
            activatePlaceholder(placeholderElement);

            placeholderElement.onclick = function () {
                onClickPassword(element, placeholderElement);
            };

            placeholderElement.onfocus = function () {
                onFocusPassword(element, placeholderElement);
            };

            element.onblur = function () {
                onBlurPassword(element, placeholderElement);
            };

            addClass(element, 'displayNone');
            element.parentNode.insertBefore(placeholderElement, element.nextSibling);
        }
    };

    /**
     * Mimics placeholder behavior on a password during an onClick event.
     *
     * @param {Object} element - The password HTML input element to polyfill.
     * @param {Object} placeholderElement - The placeholder input element of type text used for password polyfill.
     */
    var onClickPassword = function(element, placeholderElement) {
        addClass(placeholderElement, 'displayNone');
        removeClass(element, 'displayNone');
        element.focus();
    };

    /**
     * Mimics placeholder behavior on a password during an onFocus event.
     *
     * @param {Object} element - The password HTML input element to polyfill.
     * @param {Object} placeholderElement - The placeholder input element of type text used for password polyfill.
     */
    var onFocusPassword = function(element, placeholderElement) {
        onClickPassword(element, placeholderElement);
    };

    /**
     * Mimics placeholder behavior on a password during an onBlue event.
     *
     * @param {Object} element - The HTML input element to polyfill.
     * @param {Object} placeholderElement - The placeholder input element of type text used for password polyfill.
     */
    function onBlurPassword(element, placeholderElement) {
        if (!element.value.length) {
            addClass(element, 'displayNone');
            removeClass(placeholderElement, 'displayNone');
        }
    }

    /**
     * Activate the placeholder polyfill on a specified element
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var activatePlaceholder = function(element) {
        element.value = element.placeholder;
        addClass(element, placeholderClassName);
        disableTextSelection(element);
    };

    /**
     * Deactivate the placeholder polyfill on a specified element
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var deactivatePlaceholder = function(element) {
        element.value = '';
        removeClass(element, placeholderClassName);
        enableTextSelection(element);
    };

    /**
     * Mimics placeholder behavior during an onClick event.
     *
     * This will have the same behavior as when an element is focused only if the element was not active.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var onClick = function(element) {
        if (element != document.activeElement) {
            onFocus(element);
        }
    };

    /**
     * Mimics placeholder behavior during an onFocus event.
     *
     * This will remove the placeholder (if present) and enable text selection when an element is focused.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var onFocus = function(element) {
        if (hasClass(element, placeholderClassName)) {
            deactivatePlaceholder(element);
        }
    };

    /**
     * Mimics placeholder behavior during an onBlue event.
     *
     * This will set back the placeholder value and style when the focus is lost and the value is empty.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    function onBlur(element) {
        if (element.value == '') {
            activatePlaceholder(element);
        }
    }

    /**
     * Adds the specified class name to an element.
     *
     * @param {Object} element - The HTML input element to polyfill.
     * @param {string} className - The class name.
     */
    var addClass = function(element, className) {
        if (element.classList) {
            element.classList.add(className)
        } else if (!hasClass(element, className)) {
            element.className += " " + className;
            element.className = element.className.replace(/^\s+|\s+$/g, '');
        }
    };

    /**
     * Verify is a given element has a given class.
     *
     * @param {Object} element - The HTML input element to polyfill.
     * @param {string} className - The class name.
     */
    var hasClass = function (element, className) {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }
    };

    /**
     * Removes the specified class name off an element.
     *
     * @param {Object} element - The HTML input element to polyfill.
     * @param {string} className - The class name.
     */
    var removeClass = function(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else if (hasClass(element, className)) {
            var regex = new RegExp('(\\s|^)' + className + '(\\s|$)');
            element.className=element.className.replace(regex, ' ');
        }
        element.className = element.className.replace(className, '').replace(/^\s+|\s+$/g, '');
    };

    /**
     * Enables text select on an specified element.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var enableTextSelection = function(element) {
        element.onselectstart = null;
        element.onmousedown = null;
    };

    /**
     * Disabled text select on an specified element.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var disableTextSelection = function(element) {
        element.onselectstart = function () {
            return false;
        };
        element.onmousedown = function () {
            return false;
        };
    };

    /**
     * Configure a specified form to use custom before and after submit events.
     *
     * This method is used to initialize new events on form which allows to perform actions right before and right
     * after a form has been submitted. This allows tricks such as:
     *
     * - Delete input values before submitting and setting them back right after: this is invisible to a user but in
     *   the case of a placeholder a polyfill, we don't want a user to submit placeholder values.
     *
     * - Prevent browsers from saving passwords. For those of us who want to bypass some of the browser's hardcoded
     *   functionalities, setting a timeout to remove password values right after submitting will prevent browsers from
     *   auto-filling sensitive values.
     *
     * - Etc.
     *
     * @param {Object} form - The HTML form that will use custom events.
     */
    var setCustomBeforeAndAfterOnSubmitEvents = function(form) {
        if (!form.onSubmitIsSet && form.beforeOnSubmit && form.afterOnSubmit) {
            if (form.onsubmit) {
                var extraInfo = '';
                if (form.id) {
                    extraInfo = ' with id `' + form.id + '`';
                } else if (form.name) {
                    extraInfo = ' with name `' + form.id + '`';
                }
                console.log('Onsubmit event was already set on form' + extraInfo + '. Make sure that all' +
                ' scripts used on this form use the custom `beforeOnSubmit` and `afterOnSubmit` events to ensure that' +
                ' that all functionalities are operational.')
            }
            form.onsubmit = function() {
                form.beforeOnSubmit();
                form.submit();
                form.afterOnSubmit();
                return false;
            };
            form.onSubmitIsSet = true;
        }
    };

    /**
     * Add a new 'beforeOnSubmit' custom event.
     *
     * @param {Object} form - The HTML form that will use custom events.
     * @param {function} newFunction - The function to run after the page is loaded.
     */
    var addBeforeOnSubmit = function(form, newFunction) {
        var existingFunctions = form.beforeOnSubmit;
        form.beforeOnSubmit = null;
        form.beforeOnSubmit = function() {
            if (existingFunctions) {
                existingFunctions();
            }
            newFunction();
        }
    };

    /**
     * Add a new 'afterOnSubmit' custom event.
     *
     * @param {Object} form - The HTML form that will use custom events.
     * @param {function} newFunction - The function to run after the page is loaded.
     */
    var addAfterOnSubmit = function(form, newFunction) {
        var existingFunctions = form.afterOnSubmit;
        form.afterOnSubmit = null;
        form.afterOnSubmit = function() {
            if (existingFunctions) {
                existingFunctions();
            }
            newFunction();
        }
    };

    /**
     * Mimics placeholder behavior by removing element values before submit on active polyfilled elements.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var beforeOnSubmit = function(element) {
        if (hasClass(element, placeholderClassName)) {
            element.value = '';
        }
    };

    /**
     * Mimics placeholder behavior by removing element values before submit on active polyfilled elements.
     *
     * @param {Object} element - The HTML input element to polyfill.
     */
    var afterOnSubmit = function(element) {
        if (hasClass(element, placeholderClassName)) {
            element.value = element.placeholder;
        }
    };

    /**
     * Constructor.
     */
    if (!placeholderIsSupported()) {
        var inputElementsWithPlaceholders = getElementsWithPlaceholders();
        for (var iterator = 0; iterator < inputElementsWithPlaceholders.length; iterator++) {
            var element = inputElementsWithPlaceholders[iterator];
            if (element.type == 'password') {
                polyfillPassword(element);
            } else {
                polyfill(element); // Default polyfill.
            }
        }
    }
};

/**
 * Launch the fallback script after the page is loaded. The code below will make sure that this polyfill is loaded
 * after the page is loaded.
 *
 * @param {function} newFunction - The function to run after the page is loaded.
 */
function executeAfterPageLoad(newFunction) {
    var existingFunctions = window.onload;
    window.onload = null;
    window.onload = function() {
        if (existingFunctions) {
            existingFunctions();
        }
        newFunction();
    }
}
executeAfterPageLoad(placeholderPolyfill);
