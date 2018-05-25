define(window.__env__['dependencies'], function (TornadoWebSocket, ProgressBarModule) {

    describe('TornadoWebSocket', function () {
        it('should be defined', function () {
            expect(TornadoWebSocket).toBeDefined()
        })

        describe('constructor()', function () {
            it('should raise a ReferenceError', function () {
                expect(function () {
                    new TornadoWebSocket()
                }).toThrow(new ReferenceError('You must pass « path » parameter during instantiation.'))
            })

            it('should merge user options with default options', function () {
                var tws = new TornadoWebSocket('path', {
                    'port': 1234,
                    'secure': true
                })

                expect(tws._options).toEqual({
                    'auto_connect': true,
                    'host': 'localhost',
                    'port': 1234,
                    'secure': true
                })
            })

            it('should prefix path with « / »', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws._path).toEqual('/path')
                expect(tws._path).not.toEqual('path')
            })

            it('should not prefix path with « / »', function () {
                var tws = new TornadoWebSocket('/path')

                expect(tws._path).toEqual('/path')
                expect(tws._path).not.toEqual('//path')
            })
        })

        describe('connect()', function () {
            it('should not auto-connect', function () {
                spyOn(TornadoWebSocket.prototype, 'connect').and.callThrough()

                var tws = new TornadoWebSocket('path', {
                    'auto_connect': false
                })

                expect(tws.connect).not.toHaveBeenCalled()
                expect(tws._websocket).toBeNull()

                tws.connect()

                expect(tws.connect).toHaveBeenCalled()
                expect(tws._websocket).not.toBeNull()
            })

            it('should auto-connect and correctly bind events', function () {
                spyOn(TornadoWebSocket.prototype, 'connect').and.callThrough()

                var tws = new TornadoWebSocket('path')

                expect(tws.connect).toHaveBeenCalled()
                expect(tws._websocket).toEqual(jasmine.any(WebSocket))
                expect(tws._websocket.onopen).toEqual(jasmine.any(Function))
                expect(tws._websocket.onmessage).toEqual(jasmine.any(Function))
                expect(tws._websocket.onerror).toEqual(jasmine.any(Function))
                expect(tws._websocket.onclose).toEqual(jasmine.any(Function))
            })

            it('should call onopen() on an existing websocket server', function (done) {
                var tws = new TornadoWebSocket('/echo', {host: 'kocal.fr'}) // my server

                spyOn(tws._websocket, 'onopen').and.callThrough()
                spyOn(console, 'info').and.callThrough()

                setTimeout(function () {
                    expect(tws._websocket.onopen).toHaveBeenCalled()
                    expect(console.info).toHaveBeenCalledWith('TornadoWebSocket: New connection', jasmine.any(Event))

                    done()
                }, 4500)
            })

            it('should call onerror() and onclose() on a non existing websocket server', function (done) {
                var tws = new TornadoWebSocket('path', {
                    'host': 'not.an.host'
                })

                spyOn(tws._websocket, 'onerror').and.callThrough()
                spyOn(tws._websocket, 'onclose').and.callThrough()
                spyOn(console, 'error').and.callThrough()
                spyOn(console, 'info').and.callThrough()

                setTimeout(function () {
                    expect(tws._websocket.onerror).toHaveBeenCalled()
                    expect(console.error).toHaveBeenCalledWith('TornadoWebSocket: Error', jasmine.any(Event))

                    expect(tws._websocket.onclose).toHaveBeenCalled()
                    expect(console.info).toHaveBeenCalledWith('TornadoWebSocket: Connection closed', jasmine.any(CloseEvent))

                    done()
                }, 4500)
            })

            describe('test onmessage()', function () {

                beforeEach(function () {
                    spyOn(console, 'log')
                    spyOn(console, 'warn')
                })

                it('should warn about invalid JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws._websocket.onmessage('abcdef')
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not parse invalid JSON.')
                })

                it('should warn because there is no event in the JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws._websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({'key': 'data'})
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not get passed event from JSON data.')
                })

                it('should warn because there is no event in the JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws._websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({'event': 'my_event'})
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not get passed data from JSON data.')
                })

                it('should warn because event in the JSON is not binded', function () {
                    var tws = new TornadoWebSocket('path')

                    tws._websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({
                            'event': 'my_event',
                            'data': {}
                        })
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Event « my_event » is not binded.')
                })

                it('should call bound event', function () {
                    var tws = new TornadoWebSocket('path')

                    // We are testing tws._websocket.onmessage(), not tws.on()
                    tws._user_events.new_message = function (message) {
                        console.log('New message from ' + message.user.nickname + ': « ' + message.content + ' ».')
                    }

                    tws._websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({
                            'event': 'new_message',
                            'data': {
                                'content': 'My first message',
                                'user': {
                                    'nickname': 'Kocal'
                                }
                            }
                        })
                    }))

                    expect(console.log).toHaveBeenCalledWith('New message from Kocal: « My first message ».')
                })
            })
        })

        describe('bind()', function () {
            it('should correctly bind a TornadoWebSocket instance with a Module and vice-versa', function () {
                var tws = new TornadoWebSocket('path')
                var progress = new ProgressBarModule('progress')

                expect(function () {
                    expect(tws._modules).toEqual([])

                    tws.bind(progress)

                    expect(tws._modules).toEqual([progress])
                    expect(progress._websocket).toEqual(tws)
                }).not.toThrow(new TypeError('Parameter « module » should be an instance of TornadoWebSocket.Module.'))
            })
            it('should fail because it\'s not a TornadoWebSocket.Module', function () {
                var tws = new TornadoWebSocket('path')

                expect(function () {
                    tws.bind('foo')
                }).toThrow(new TypeError('Parameter « module » should be an instance of TornadoWebSocket.Module.'))
            })
        })

        describe('on()', function () {
            it('should fails when callback is not a function', function () {
                var tws = new TornadoWebSocket('path')

                expect(function () {
                    tws.on('my_first_event', 'not a function')
                }).toThrow(new TypeError('You must pass a function for « callback » parameter.'))
            })

            it('should bind « classic » events to internal events dictionary', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws._user_events['my_event']).toBeUndefined()

                tws.on('my_event', function () {})

                expect(tws._user_events['my_event']).toEqual(jasmine.any(Function))
            })

            it('should bind « special » events to websocket instance', function () {
                var tws = new TornadoWebSocket('path')

                // 1. Auto-connect is on, and the 4 events are bound
                expect(tws._websocket.onopen).toEqual(jasmine.any(Function))
                expect(tws._websocket.onmessage).toEqual(jasmine.any(Function))
                expect(tws._websocket.onerror).toEqual(jasmine.any(Function))
                expect(tws._websocket.onclose).toEqual(jasmine.any(Function))

                // 2. Remove the 4 events
                tws._websocket_events.onopen = null
                tws._websocket_events.onmessage = null
                tws._websocket_events.onerror = null
                tws._websocket_events.onclose = null

                expect(tws._websocket_events.onopen).toBeNull()
                expect(tws._websocket_events.onmessage).toBeNull()
                expect(tws._websocket_events.onerror).toBeNull()
                expect(tws._websocket_events.onclose).toBeNull()

                // 3. Then open a WebSocket connection with 4 unbound events
                tws.connect()

                expect(tws._websocket.onopen).toBeNull()
                expect(tws._websocket.onmessage).toBeNull()
                expect(tws._websocket.onerror).toBeNull()
                expect(tws._websocket.onclose).toBeNull()

                // 4. Bound those 4 events again
                tws.on('open', function () {})
                tws.on('message', function () {})
                tws.on('error', function () {})
                tws.on('close', function () {})

                tws.connect()

                expect(tws._websocket.onopen).toEqual(jasmine.any(Function))
                expect(tws._websocket.onmessage).toEqual(jasmine.any(Function))
                expect(tws._websocket.onerror).toEqual(jasmine.any(Function))
                expect(tws._websocket.onclose).toEqual(jasmine.any(Function))
            })
        })

        describe('emit()', function () {
            beforeEach(function () {
                spyOn(WebSocket.prototype, 'send')
            })

            it('should emit event without data', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event')
                    expect(tws._websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{}}')
                    done()
                })
            })

            it('should emit event with data which is a dictionary', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event', {'id': 1})
                    expect(tws._websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{"id":1}}')
                    done()
                })
            })

            it('should emit event with data which is not a dictionary, by converts it to a dict', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event', 'My message.')
                    expect(tws._websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{"message":"My message."}}')
                    done()
                })
            })
        })

        describe('_build_url()', function () {
            it('should build correctly the url without secure', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws._url).toEqual(tws._build_url())
                expect(tws._url).toEqual('ws://localhost:8000/ws/path')
            })

            it('should build correctly the url with secure', function () {
                var tws = new TornadoWebSocket('path', {secure: true})

                expect(tws._url).toEqual(tws._build_url())
                expect(tws._url).toEqual('wss://localhost:8000/ws/path')
            })
        })
    })
})