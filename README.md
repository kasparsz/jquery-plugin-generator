[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]

# jquery-plugin-generator

> jQuery plugin generator from classes / functions

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install jquery-plugin-generator --save
```

## Usage

```js
var generate = require('jquery-plugin-generator');

function MyPlugin ($element, options) {
    this.$element = $element;
    this.options  = $.extend({'firstName': '', 'lastName': ''}, options);

    this.update(this.options.firstName, this.options.lastName);
}

MyPlugin.prototype = {
    update: function (firstName, lastName) {
        console.log(firstName + ' ' + lastName);
    }
};

$.fn.myplugin = generate(MyPlugin /* function / class */, {} /* generator options */);

/* Use plugin, will be called only once for each element */
$('div').myplugin({'firstName': 'John', 'lastName': 'Doe'});
//=> John Doe

/* Call api method */
$('div').myplugin('update' /* api method name */, 'Jane', 'Doe');
//=> Jane Doe
```

## API

#### `generator(fn, [options])`

`fn` Function / class, which will be called using `new` keyword for each element plugin is called for. As first argument will be passed jQuery element, all following arguments will be same as they were used when calling a plugin.

### Options

| Name     | Type    | Usage                                    | Default  |
| -------- | ------- | ---------------------------------------- | -------- |
| api    | Array | List of method / function names, which are accessible using ```.myplugin('apiMethodName')``` By default all methods are accessible  | null     |

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## License

Copyright © 2016, [Kaspars Zuks](https://github.com/kasparsz).
Released under the [MIT license](https://github.com/kasparsz/jquery-plugin-generator/blob/master/LICENSE).
