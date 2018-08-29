const express = require('express');
const request = require('supertest');

const asyncErrorWrapper = require('./index');

const port = 8088;

describe('express-async-error-wrapper', function() {
    let app;
    let server;
    let errorMw;

    describe('regular middleware wrapping', function() {

        beforeEach(async function() {
            app = express();

            app.get('/ok', asyncErrorWrapper((req, res, next) => {
                res.status(200).type('text').send('OK');
            }));

            app.get('/sync-error', asyncErrorWrapper((req, res, next) => {
                throw new Error('Error 1');
            }));

            app.get('/async-error-next', asyncErrorWrapper((req, res, next) => {
                setTimeout(() => {
                    next(new Error('Error 2'));
                }, 1);
            }));

            app.get('/async-error-promise', asyncErrorWrapper(async (req, res, next) => {
                throw new Error('Error 3');
            }));

            // Don't propagate our test errors throught the process, just bring them into a form we can analyze.
            app.use(function(err, req, res, next) {
                return res.status(500).json({
                    error: err.toString(),
                });
            });

            return new Promise((resolve, reject) => {
                try {
                    server = app.listen(port, (err) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve();
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        });


        it('should not return an error when no error is thrown', function(done) {
            request(app)
                .get('/ok')
                .expect(200, 'OK')
                .expect('Content-Type', 'text/plain; charset=utf-8', done)
            ;
        });

        it('should work with non-async functions', function(done) {
            request(app)
                .get('/sync-error')
                .expect(500, {
                    error: 'Error: Error 1',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should work correctly with an async function that passes its error to next()', function(done) {
            request(app)
                .get('/async-error-next')
                .expect(500, {
                    error: 'Error: Error 2',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should work correctly with a true async function', function(done) {
            request(app)
                .get('/async-error-promise')
                .expect(500, {
                    error: 'Error: Error 3',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        afterEach(async function() {
            return new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        return reject(err);
                    }

                    app = undefined;
                    server = undefined;
                    errorMw = undefined;

                    resolve();
                });
            });
        });
    });

    describe('error middleware wrapping', function() {

        beforeEach(async function() {
            app = express();

            app.get('/ok', asyncErrorWrapper((req, res, next) => {
                res.status(200).type('text').send('OK');
            }));

            app.get('/sync-error', asyncErrorWrapper((req, res, next) => {
                throw new Error('Error 1');
            }));

            app.get('/async-error-next', asyncErrorWrapper((req, res, next) => {
                setTimeout(() => {
                    next(new Error('Error 2'));
                }, 1);
            }));

            app.get('/async-error-promise', asyncErrorWrapper(async (req, res, next) => {
                throw new Error('Error 3');
            }));

            app.use(asyncErrorWrapper(async (err, req, res, next) => {
                throw new Error('Error handler error: ' + err.toString());
            }));

            // Don't propagate our test errors throught the process, just bring them into a form we can analyze.
            app.use(function(err, req, res, next) {
                return res.status(500).json({
                    error: err.toString(),
                });
            });

            return new Promise((resolve, reject) => {
                try {
                    server = app.listen(port, (err) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve();
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        });


        it('should not return an error when no error is thrown', function(done) {
            request(app)
                .get('/ok')
                .expect(200, 'OK')
                .expect('Content-Type', 'text/plain; charset=utf-8', done)
            ;
        });

        it('should work with non-async functions', function(done) {
            request(app)
                .get('/sync-error')
                .expect(500, {
                    error: 'Error: Error handler error: Error: Error 1',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should work correctly with an async function that passes its error to next()', function(done) {
            request(app)
                .get('/async-error-next')
                .expect(500, {
                    error: 'Error: Error handler error: Error: Error 2',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should work correctly with a true async function', function(done) {
            request(app)
                .get('/async-error-promise')
                .expect(500, {
                    error: 'Error: Error handler error: Error: Error 3',
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        afterEach(async function() {
            return new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        return reject(err);
                    }

                    app = undefined;
                    server = undefined;
                    errorMw = undefined;

                    resolve();
                });
            });
        });
    });
});

