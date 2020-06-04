[npm-url]: https://npmjs.org/package/jquery-plugin-generator
[npm-image]: http://img.shields.io/npm/v/jquery-plugin-generator.svg
[travis-url]: https://travis-ci.org/kasparsz/jquery-plugin-generator
[travis-image]: http://img.shields.io/travis/kasparsz/jquery-plugin-generator.svg

# jquery-plugin-generator
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

jQuery plugin generator from classes / functions

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install jquery-plugin-generator --save
```

## Usage

### Create plugin

```js
var generate = require('jquery-plugin-generator');

function MyPlugin ($element, options) {
    this.options = $.extend({'firstName': '', 'lastName': ''}, options);

    console.log('constructor: ' + this.options.firstName + ' ' + this.options.lastName);
}

MyPlugin.prototype = {
    update: function (firstName, lastName) {
        console.log('update: ' + firstName + ' ' + lastName);
    }
};

$.fn.myplugin = generate(MyPlugin /* function or ES6 class */, {} /* plugin generator options */);
```

### Call plugin

jQuery plugin can be called on the same element multiple times, but constructor (MyPlugin) will be called on each element only once.

Constructors first argument always will be jQuery element, all other arguments will be passed to the constructor as is.
```js
$('div').myplugin({'firstName': 'John', 'lastName': 'Doe'});
//console => constructor: John Doe
```

Call MyPlugin API method by passing function name as first argument, rest of the arguments will be passed to the function unchanged
```js
$('div').myplugin('update', 'Jane', 'Doe');
//console => update: Jane Doe
```

Calling API method on element for first time will first call constructor and then API method.
Constructor will be called with `options` empty.
```js
$('div').myplugin('update', 'Jonathan', 'Doe');
//console => constructor:
//console => update: Jonathan Doe
```

## Calling plugin on same element multiple times

Constructor is called only once, but to allow plugins to change options or do something else on subsequent calls you can implement ```setOptions``` method.

```setOptions``` will be called if constructor has already been called on the element and it will the same arguments with which plugin was called.
If function or class method doesn't have this method, then will fail silently.

You can specify different method name by passing ```optionsSetter``` option to the generator.

```js
function MyPlugin ($element, options) {
    this.options = $.extend({'firstName': '', 'lastName': ''}, options);

    console.log('constructor: ' + this.options.firstName + ' ' + this.options.lastName);
}

MyPlugin.prototype = {
    update: function (options) {
        console.log('update: ' + options.firstName + ' ' + options.lastName);
    }
};

$.fn.myplugin = generate(MyPlugin, {'optionsSetter': 'update'});



$('div').myplugin({'firstName': 'John', 'lastName': 'Doe'});
//console => constructor: John Doe

$('div').myplugin({'firstName': 'Jonathan', 'lastName': 'Doe'});
//console => update: Jonathan Doe
```

## Getting class/function instance from element

To get class/function instance call ```myplugin('instance')``` API method.
If plugin is not called on element before then it will return ```null```.

```js
// Plugin hasn't been called on element before, will return null
$('div').myplugin('instance'); // => null

// Call plugin on element
$('div').myplugin({'firstName': 'John', 'lastName': 'Doe'});

// 
$('div').myplugin('instance'); // => MyPlugin {options: {...}}
$('div').myplugin('instance').options.firstName // => "John"
```

## API

#### `generator(fn, [options])`

`fn` Function or ES6 class, which will be called using `new` keyword for each element plugin is called for. As first argument will be passed jQuery element, all following arguments will be same as they were used when calling a plugin.

### Plugin generator options

| Name     | Type    | Usage                                    | Default  |
| -------- | ------- | ---------------------------------------- | -------- |
| api    | Array | List of method / function names, which are accessible using ```.myplugin('apiMethodName')``` By default all methods are accessible  | null     |
| optionsSetter | String | Method name. If plugin has already been initialized, then calling plugin again on same element will trigger method with this name | setOptions |

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## License

Copyright © 2020, [Kaspars Zuks](https://github.com/kasparsz).
Released under the [MIT license](https://github.com/kasparsz/jquery-plugin-generator/blob/master/LICENSE).

[npm-url]: https://npmjs.org/package/jquery-plugin-generator
[npm-image]: http://img.shields.io/npm/v/jquery-plugin-generator.svg
[travis-url]: https://travis-ci.org/kasparsz/jquery-plugin-generator
[travis-image]: http://img.shields.io/travis/kasparsz/jquery-plugin-generator.svg
