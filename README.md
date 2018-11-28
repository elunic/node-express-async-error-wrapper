# @elunic/express-async-error-wrapper

A simple, minimalistic wrapper for Express middlewares that ensures errors from middleware promises are handled properly; correctly wraps non-async functions

Ensures errors in promises from async route handlers/middlewares do not float around an crash your server.

Does **not** expect wrapper middlewares to return a promise, so you don't have to worry about changing
your middleware functions from sync to async.

**Does not** call `next()` for you. If you have an async route/middleware and forget to call `next()` or `res.send()`, you're on your own.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)


## Installation

```bash
$ npm install @elunic/express-async-error-wrapper
```


## Usage

Examples:


##### Regular middlewares:
```js
const app = require('express')();
const asyncErrorWrapper = require('@elunic/express-async-error-wrapper');
// In TypeScript:
// import { asyncErrorWrapper } from '@elunic/express-async-error-wrapper';

app.get('/get1', asyncErrorWrapper(async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    throw new Error('Error 1');
}));

app.get('/get2', async (req, res) => {
    throw new Error('Error 2');
});

app.use(function(err, req, res, next) {
    // Will catch Error 1, but not Error 2 
});

app.listen(80);
```


##### Error middlewares:
```js
const app = require('express')();
const asyncErrorWrapper = require('@elunic/express-async-error-wrapper');

app.get('/get1', asyncErrorWrapper(async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    throw new Error('Error 1');
}));

app.get(asyncErrorWrapper(async (err, req, res, next) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    throw new Error('Error handler error: ' + err.toString());
}));

app.use(function(err, req, res, next) {
    // Will get called with the error handler's error 
});

app.listen(80);
```


## License

(The MIT License)

Copyright (c) 2018 elunic &lt;wh@elunic.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
