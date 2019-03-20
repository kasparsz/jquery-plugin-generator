'use strict';

require('mocha');
var assert = require('assert');

var fs = require('fs');
var jsdom = require('jsdom');
var jQuery = fs.readFileSync('./node_modules/jquery/dist/jquery.js', "utf-8");
var generate = require('./dist/jquery-plugin-generator.js');

function createTestEnv(fn) {
    return function (done) {
        var dom = new jsdom.JSDOM('<html><body></body></html>', {'runScripts': 'dangerously'});
        var window = dom.window;

        var script = window.document.createElement('script');
        script.textContent = jQuery;
        window.document.body.appendChild(script);

        fn(done, window.$);
        window.close(); // clean up memory
    };
}


describe('jquery-plugin-generator', function(done) {

    it('should fail on invalid fn argument', function() {

        assert.throws(function () {
            generate(null);
        }, /required/);

    });

    it('should return a function', function () {

        var plugin = generate(function () {});
        assert.equal('function', typeof plugin);

    });

    it('should call constructor for each element once', createTestEnv(function (done, $) {
        var called = 0;

        $.fn.test = generate(function () { called++; });

        $('<div></div><div></div>').test().test().test();

        assert.equal(called, 2);
        done();
    }));

    it('should call constructor with `new` keyword', createTestEnv(function (done, $) {
        var plugin = function () {
            assert.equal(this instanceof plugin, true);
            done();
        };

        $.fn.test = generate(plugin);

        $('<div></div>').test();
    }));

    it('should call api method after constructor', createTestEnv(function (done, $) {
        var called = 0;

        var plugin = function () {
            this.method = function () { called++; };
        };

        $.fn.test = generate(plugin);

        $('<div></div><div></div>').test('method');

        assert.equal(called, 2);
        done();
    }));

    it('should pass arguments to constructor', createTestEnv(function (done, $) {
        var args = [];

        var plugin = function (element, a, b, c) {
            args = [element, a, b, c];
            this.method = function () {};
        };

        $.fn.test = generate(plugin);


        var element = $('<div></div>');

        element.test(1, 'a', []).test('method', 2, 'b', {});

        assert.equal(args[0].get(0), element.get(0));
        assert.equal(args[1], 1);
        assert.equal(args[2], 'a');
        assert.deepEqual(args[3], []);
        done();
    }));

    it('should pass arguments to api method', createTestEnv(function (done, $) {
        var plugin = function () {
            this.method = function (a, b, c) {
                assert.equal(a, 1);
                assert.equal(b, 'string');
                assert.deepEqual(c, []);
                done();
            };
        };

        $.fn.test = generate(plugin);

        $('<div></div>').test().test('method', 1, 'string', []);
    }));

    it('should return api method response', createTestEnv(function (done, $) {
        var plugin = function () {
            this.method = function () {
                return 'response';
            };
        };

        $.fn.test = generate(plugin);

        assert.equal( $('<div></div>').test('method'), 'response' );
        done();
    }));

    it('should be chainable', createTestEnv(function (done, $) {
        $.fn.test = generate(function () {});

        var elements = $('<div></div><div></div>');
        var response = elements.test();

        assert.equal(elements.length, response.length);
        assert.equal(elements.get(0), response.get(0));
        assert.equal(elements.get(1), response.get(1));

        done();
    }));

    it('should call setOptions on subsequent calls', createTestEnv(function (done, $) {
        var pluginCalled = 0;
        var pluginArgs = [];
        var setOptionsCalled = 0;
        var setOptionsArgs = [];

        var args = [];

        var plugin = function (element, a, b) {
            pluginCalled++;
            pluginArgs = [element, a, b];

            this.setOptions = function (a, b) {
                setOptionsCalled++;
                setOptionsArgs = [a, b];
            };
        };

        $.fn.test = generate(plugin);

        var element = $('<div></div>');

        element.test({'a': 1}, 'b'); // constructor

        element.test({'a': 2}, 'd'); // setOptions
        element.test({'a': 3}, 'f'); // setOptions

        assert.equal(pluginCalled, 1);
        assert.equal(pluginArgs[0].get(0), element.get(0));
        assert.deepEqual(pluginArgs[1], {'a': 1});
        assert.equal(pluginArgs[2], 'b');

        assert.equal(setOptionsCalled, 2);
        assert.deepEqual(setOptionsArgs[0], {'a': 3});
        assert.equal(setOptionsArgs[1], 'f');

        done();
    }));

    it('calling `instance` API method shouldn\'t create a new instance if it doesn\'t exist', createTestEnv(function (done, $) {
        var plugin = function () {
            throw 'Instance was created while it shouldn\'t be';
        };

        $.fn.test = generate(plugin);

        var instance = $('<div></div>').test('instance');

        assert.equal(instance, null);

        done();
    }));

    it('calling `instance` API method should return function/class instance', createTestEnv(function (done, $) {
        var plugin = function () {};

        $.fn.test = generate(plugin);

        var element = $('<div></div>');
        element.test();

        var instance = element.test('instance');

        assert.equal(typeof instance, 'object');
        assert.equal(instance instanceof plugin, true);

        done();
    }));

});
