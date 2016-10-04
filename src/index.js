/*!
 * jquery-plugin-generator <https://github.com/kasparsz/jquery-plugin-generator>
 *
 * Copyright (c) 2016, Kaspars Zuks.
 * Licensed under the MIT License.
 */

// guid counter
var UID = 0;

/**
 * Generate non-random string
 *
 * @returns {string} String
 */
function guid () {
    return `ns${UID++}`;
}


/**
 * Returns class / function instance, creates if it doesn't exist yet
 *
 * @param {object} $element jQuery element
 * @param {function} fn Class / function
 * @param {array} params Parameters for class / function constructor
 * @param {object} options Generator options
 * @returns {object} Instance
 */
function getInstance ($element, fn, params, options) {
    let instance = $element.data(options.namespace);

    // Create instance
    if (!instance) {
        // See http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible#answer-8843181
        var f = fn.bind.apply(fn, [fn, $element].concat(params));
        instance = new f();

        if (!instance || typeof instance !== 'object') {
            // Failure, possibly intentional by function, skip
            return;
        } else {
            $element.data(options.namespace, instance);
        }
    } else {
        // Set options
        if (options.optionsSetter && typeof instance[options.optionsSetter] === 'function') {
            instance[options.optionsSetter].apply(instance, params);
        }
    }

    return instance;
}

/**
 * Returns API function name and parameters from arguments
 *
 * @param {array} args Arguments
 * @param {object} options Generator options
 * @returns {object} Api name, api params and constructor params
 */
function getAPICallParams (args, options) {
    if (typeof args[0] === 'string') {
        let name = args[0];
        let apiMethods = options.api;

        if ((!apiMethods || apiMethods.indexOf(name) !== -1)) {
            return { apiName: name, apiParams: args.slice(1), params: [] };
        }
    }

    return { apiName: null, apiParams: null, params: args };
}

/**
 * Call
 *
 * @param {object} $element jQuery element
 * @param {function} fn Class / function
 * @param {array} args Arguments with which plugin was called
 * @param {object} options Generator options
 * @returns {object} API method result
 */
function call ($element, fn, args, options) {
    // We can't cache, because class / function constructor may assign properties
    const { apiName, apiParams, params } = getAPICallParams(args, options);
    const instance = getInstance($element, fn, params, options);

    if (instance && apiName) {
        if (apiName === 'instance') {
            // Special API method, returns class / function instance
            return instance;
        } else if (apiName && typeof instance[apiName] === 'function') {
            return instance[apiName].apply(instance, apiParams);
        }
    }
}

/**
 * Itterate through all elements and create instances and / or call API method
 *
 * @param {object} $elements jQuery element collection
 * @param {function} fn Class / function
 * @param {array} args Arguments with which plugin was called
 * @param {object} options Generator options
 * @returns {object} API method result or jQuery element collection
 */
function itterate ($elements, fn, args, options) {
    let result = $elements;
    let i = 0;
    let ii = $elements.length;

    for (; i < ii; i++) {
        let value = call($elements.eq(i), fn, args, options);

        if (value !== void 0) {
            result = value;
        }
    }

    return result;
}

/**
 * Generate a plugin
 *
 * @param {function} fn Class or function for which plugin will be generated
 * @param {object?} options Generator options
 * @returns {function} jQuery plugin
 */
function generate (fn, opts = {}) {
    const options = Object.assign({
        // List of API method names, by default all methods are available for API access
        'api': null,

        // Namespace, which is used to store class / function instance in element data
        'namespace': guid(),

        // Options setter method name
        'optionsSetter': 'setOptions'
    }, opts);

    if (typeof fn === 'function') {
        return function (...args) {
            return itterate(this, fn, args, options);
        };
    } else {
        throw 'fn is required field for jquery-plugin-generator';
    }
}

// CommonJS
module.exports = generate;
