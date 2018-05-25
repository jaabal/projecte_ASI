define(window.__env__['dependencies'], function (TornadoWebSocket) {
    describe('TornadoWebSocket.Module', function () {

        var MyModule = class extends TornadoWebSocket.Module {
            constructor(prefix) {
                super(prefix)
            }
        }

        describe('constructor()', function () {
            it('should not be instantiated directly', function () {
                expect(function () {
                    new TornadoWebSocket.Module()
                }).toThrow(new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.'))
            })

            it('should be inherited by a sub class', function () {
                var myModule = new MyModule('my_module')

                expect(myModule._name).toBe('module_my_module')
            })
        })

        describe('on()', function () {
            it('should call tws.on() with a prefix', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                spyOn(tws, 'on')

                tws.bind(myModule)
                myModule.on('my_event', function () {})

                expect(tws.on).toHaveBeenCalledWith('module_my_module_my_event', jasmine.any(Function))
            })
        })

        describe('emit()', function () {
            it('should call tws.emit() with a prefix', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                spyOn(tws, 'emit')

                tws.bind(myModule)
                myModule.emit('my_event')

                expect(tws.emit).toHaveBeenCalledWith('module_my_module_my_event', {})
            })
        })
    })
})