define(window.__env__['dependencies'], function (TornadoWebSocket, ModuleProgressBar) {

    describe('ModuleProgressBar', function () {
        it('should be defined', function () {
            expect(ModuleProgressBar).toBeDefined()
        })

        describe('constructor()', function () {
            it('should correctly prefixed', function () {
                var progressbar = new ModuleProgressBar('foo')

                expect(progressbar._name).toBe('module_progressbar_foo_')
            })
        })

        describe('set_engine()', function () {
            it('should throw an error because it expected an instance of ProgressBar.EngineInterface', function () {
                var progressbar = new ModuleProgressBar('foo')

                expect(function () {
                    progressbar.set_engine('not an engine')
                }).toThrow(new TypeError('Parameter « engine » should be an instance of ModuleProgressBar.EngineInterface.'))
            })

            it('should correctly call engine\'s oninit/onupdate', function () {
                var tws = new TornadoWebSocket('foo')
                var progressbar = new ModuleProgressBar('foo')
                var bootstrapEngine = new ModuleProgressBar.EngineBootstrap(document.body, {})

                spyOn(tws, 'on').and.callThrough()
                spyOn(progressbar, 'on').and.callThrough()
                spyOn(bootstrapEngine, 'render').and.callThrough()
                spyOn(bootstrapEngine, 'on_init').and.callThrough()
                spyOn(bootstrapEngine, 'on_update')
                spyOn(bootstrapEngine, 'update_values')

                tws.bind(progressbar)
                progressbar.set_engine(bootstrapEngine)

                expect(progressbar._engine).toBe(bootstrapEngine)
                expect(progressbar.on).toHaveBeenCalledWith('init', jasmine.any(Function))
                expect(progressbar.on).toHaveBeenCalledWith('update', jasmine.any(Function))
                expect(tws.on).toHaveBeenCalledWith('module_progressbar_foo_init', jasmine.any(Function))
                expect(tws.on).toHaveBeenCalledWith('module_progressbar_foo_update', jasmine.any(Function))
                expect(bootstrapEngine.render).toHaveBeenCalled()

                tws._user_events['module_progressbar_foo_init']({})
                tws._user_events['module_progressbar_foo_update']({})

                expect(bootstrapEngine.on_init).toHaveBeenCalledWith({})
                expect(bootstrapEngine.on_update).toHaveBeenCalledWith({})
            })
        })

        describe('getters and setters', function () {
            it('tests for min/max/current/progression', function () {
                var tws = new TornadoWebSocket('foo')
                var progressbar = new ModuleProgressBar('foo')
                var bootstrapEngine = new ModuleProgressBar.EngineBootstrap(document.body)

                tws.bind(progressbar)
                spyOn(bootstrapEngine, '_handle_value')

                expect(progressbar.min).toEqual(void 0)
                expect(progressbar.max).toEqual(void 0)
                expect(progressbar.current).toEqual(void 0)
                expect(progressbar.progression).toEqual(void 0)

                // Set the engine and set values
                progressbar.set_engine(bootstrapEngine)

                bootstrapEngine.update_values({'min': 0, 'max': 100, 'current': 50})

                expect(progressbar.min).toEqual(0)
                expect(progressbar.max).toEqual(100)
                expect(progressbar.current).toEqual(50)
                expect(progressbar.progression).toEqual(50)
            })
        })

        describe('EngineInterface', function () {
            describe('constructor()', function () {
                it('should fail because $container is undefined nor an HTMLElement', function () {
                    expect(function () {
                        new ModuleProgressBar.EngineInterface()
                    }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))

                    expect(function () {
                        new ModuleProgressBar.EngineInterface('foo')
                    }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                })

                it('should works because $container is an HTMLElement', function () {
                    expect(function () {
                        var engine = new ModuleProgressBar.EngineInterface(document.body)

                        expect(engine._$container).toBe(document.body)
                        expect(engine._options).toEqual({})
                    }).not.toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                })
            })

            describe('render()', function () {
                it('should correctly call _create_elements() and _render_element()', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, '_create_elements')
                    spyOn(engine, '_render_elements')

                    engine.render()

                    expect(engine._create_elements).toHaveBeenCalled()
                    expect(engine._render_elements).toHaveBeenCalled()
                })
            })

            describe('on_init()', function () {
                it('should use default values for the progress bar', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, 'on_update')
                    spyOn(engine, 'update_values')

                    engine.on_init({'indeterminate': true})

                    expect(engine.update_values).toHaveBeenCalledWith({
                        'min': 0,
                        'max': 100,
                        'current': 0,
                        'indeterminate': true
                    })
                    expect(engine.on_update).toHaveBeenCalledWith({'current': 0})
                })

                it('should use values sent by the server', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, 'on_update')
                    spyOn(engine, 'update_values')

                    engine.on_init({'indeterminate': false, 'min': 0, 'current': 100, 'max': 250})

                    expect(engine.update_values).toHaveBeenCalledWith({
                        'min': 0,
                        'max': 250,
                        'current': 100,
                        'indeterminate': false
                    })
                    expect(engine.on_update).toHaveBeenCalledWith({'current': 100})
                })
            })

            describe('on_update()', function () {
                it('should correctly call sub functions', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, 'update_values')
                    spyOn(engine, '_update_progression')
                    spyOn(engine, '_update_label')

                    engine.on_update({'current': 50, 'label': '[50/100] Progression...'})

                    expect(engine.update_values).toHaveBeenCalledWith({'current': 50, 'label': '[50/100] Progression...'})
                    expect(engine._update_progression).toHaveBeenCalled()
                    expect(engine._update_label).toHaveBeenCalledWith('[50/100] Progression...')
                })
            })

            describe('compute_progression()', function () {
                it('should correctly compute the progression', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, '_handle_value')
                    spyOn(engine, 'on_update')

                    // @TODO change 'value' to 'current'
                    engine.on_init({'indeterminate': false, 'min': 0, 'current': 50, 'max': 100})
                    expect(engine.compute_progression()).toEqual(50)

                    engine.on_init({'indeterminate': false, 'min': 100, 'current': 150, 'max': 200})
                    expect(engine.compute_progression()).toEqual(50)

                    engine.on_init({'indeterminate': false, 'min': 0, 'current': 2, 'max': 10})
                    expect(engine.compute_progression()).toEqual(20)
                })
            })

            describe('format_progression()', function () {
                it('should fail because there is no defined template for the progression', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine.format_progression(undefined, 50)

                        // It depends of the browser, the 1st message is for Firefox, the 2nd is for Chrome/Opera (blink/webkit)
                    }).toThrowError(TypeError, /(Cannot read property 'replace' of undefined)|(format is undefined)/)
                })

                it('should correctly format the progression with user defined template', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(engine.format_progression('Progression: {{progress}}%', 50)).toEqual('Progression: 50%')
                    expect(engine.format_progression('{{ progress }}% {{ progress}}%', 20)).toEqual('20% 20%')
                    expect(engine.format_progression('{{progress }}%', 100)).toEqual('100%')
                })
            })

            describe('update_values()', function () {
                it('should correctly works', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    spyOn(engine, '_handle_value')

                    expect(engine._values.min).toBeUndefined()
                    expect(engine._values.max).toBeUndefined()
                    expect(engine._values.current).toBeUndefined()

                    engine.update_values({'min': 0, 'max': 100, 'current': 50})

                    expect(engine._values.min).toEqual(0)
                    expect(engine._handle_value).toHaveBeenCalledWith('min', 0)
                    expect(engine._values.max).toEqual(100)
                    expect(engine._handle_value).toHaveBeenCalledWith('max', 100)
                    expect(engine._values.current).toEqual(50)
                    expect(engine._handle_value).toHaveBeenCalledWith('current', 50)
                })
            })

            describe('_handle_value()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine._handle_value('min', 0)
                    }).toThrow(new Error('Method « _handle_value » should be implemented by the engine.'))
                })
            })

            describe('_create_elements()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine._create_elements()
                    }).toThrow(new Error('Method « _create_elements » should be implemented by the engine.'))
                })
            })

            describe('_render_elements()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine._render_elements()
                    }).toThrow(new Error('Method « _render_elements » should be implemented by the engine.'))
                })
            })

            describe('_update_label()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine._update_label('My label')
                    }).toThrow(new Error('Method « _update_label » should be implemented by the engine.'))
                })
            })

            describe('_update_progression()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ModuleProgressBar.EngineInterface(document.body)

                    expect(function () {
                        engine._update_progression()
                    }).toThrow(new Error('Method « _update_progression » should be implemented by the engine.'))
                })
            })

            describe('EngineBootstrap', function () {
                describe('constructor()', function () {
                    it('should call EngineInterface::constructor() and fail because $container is undefined nor an HTMLElement', function () {
                        expect(function () {
                            new ModuleProgressBar.EngineBootstrap()
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))

                        expect(function () {
                            new ModuleProgressBar.EngineBootstrap('foo')
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                    })

                    it('should assign « real » options with defaults options of the engine', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        expect(engineBootstrap._options).toEqual({
                            'label_visible': true,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progressbar_context': 'info',
                            'progressbar_striped': false,
                            'progressbar_animated': false,
                            'progression_visible': true,
                            'progression_format': '{{progress}} %',
                        })
                    })

                    it('should merge « real » options, defaults options of the engine, with the user ones', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'label_visible': false,
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        expect(engineBootstrap._options).toEqual({
                            'label_visible': false,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progressbar_context': 'info',
                            'progressbar_striped': false,
                            'progressbar_animated': false,
                            'progression_visible': true,
                            'progression_format': 'Progression: {{progress}}%',
                        })
                    })
                })

                describe('render()', function () {
                    it('should correctly call _create_elements() and _render_element()', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        spyOn(engineBootstrap, '_create_elements')
                        spyOn(engineBootstrap, '_render_elements')

                        engineBootstrap.render()

                        expect(engineBootstrap._create_elements).toHaveBeenCalled()
                        expect(engineBootstrap._render_elements).toHaveBeenCalled()
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        engineBootstrap.render()
                        engineBootstrap.update_values({'min': 0, 'max': 100, 'current': 50})
                        engineBootstrap._update_progression()

                        expect(engineBootstrap._$progression.textContent).toEqual('Progression: 50%')
                        expect(engineBootstrap._$progressbar.style.width).toEqual('50%')
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progresssion_format': 'Progression: {{progress}}%'
                        })

                        engineBootstrap.render()
                        expect(engineBootstrap._$label.textContent).toEqual('')

                        engineBootstrap._update_label('foo')
                        expect(engineBootstrap._$label.textContent).toEqual('foo')

                        engineBootstrap._update_label()
                        expect(engineBootstrap._$label.textContent).toEqual('')
                    })
                })

                describe('_create_elements()', function () {
                    it('should create elements by following the default behavior', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        expect(engineBootstrap._$progress).toBeUndefined()
                        expect(engineBootstrap._$progression).toBeUndefined()
                        expect(engineBootstrap._$progressbar).toBeUndefined()
                        expect(engineBootstrap._$label).toBeUndefined()

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progress).toEqual(jasmine.any(HTMLDivElement))
                        expect(engineBootstrap._$progress.classList).toContain('progress')

                        expect(engineBootstrap._$progressbar).toEqual(jasmine.any(HTMLDivElement))
                        expect(engineBootstrap._$progressbar.classList).toContain('progress-bar')
                        expect(engineBootstrap._$progressbar.getAttribute('role')).toEqual('progressbar')
                        expect(engineBootstrap._$progressbar.classList).toContain('progress-bar-info')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-success')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-warning')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-danger')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('active')

                        expect(engineBootstrap._$progression).toEqual(jasmine.any(HTMLSpanElement))
                        expect(engineBootstrap._$progression).not.toContain('sr-only')

                        expect(engineBootstrap._$label).toEqual(jasmine.any(HTMLSpanElement))
                        // Can't compare a DOMTokenList ($label.classList) to an array with .toEqual method
                        expect(engineBootstrap._$label.className.split(' ')).toEqual(['progressbar-label'])
                        expect(engineBootstrap._$label.style.display).not.toEqual('none')
                    })

                    it('should not allow an invalid `progressbar_context`', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progressbar_context': 'foo'
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-info')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-success')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-warning')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-danger')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-foo')
                    })

                    it('should « strip » the progressbar', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progressbar_striped': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('active')
                    })

                    it('should not animate the progressbar because it\'s not striped', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progressbar_animated': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('active')
                    })

                    it('should correctly animate the progressbar when it\'s not striped', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progressbar_animated': true,
                            'progressbar_striped': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).toContain('active')
                    })

                    it('the $progression should be screen-reader visible only', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'progression_visible': false
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$progression.classList).toContain('sr-only')
                    })

                    it('the $label should not be visible ', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'label_visible': false
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap._$label.style.display).toEqual('none')
                    })
                })

                describe('_render_elements()', function () {
                    it('should render elements by following the default behavior', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        engineBootstrap._create_elements()
                        engineBootstrap._render_elements()

                        expect(engineBootstrap._$progression.parentNode).toEqual(engineBootstrap._$progressbar)
                        expect(engineBootstrap._$progressbar.parentNode).toEqual(engineBootstrap._$progress)
                        expect(engineBootstrap._$progress.parentNode).toEqual(engineBootstrap._$container)
                        expect(engineBootstrap._$label.nextSibling).toEqual(engineBootstrap._$progress)
                    })

                    it('should render elements with $label at the bottom', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body, {
                            'label_position': 'bottom'
                        })

                        engineBootstrap.render()

                        expect(engineBootstrap._$progress.nextSibling).toEqual(engineBootstrap._$label)
                    })
                })

                describe('_handle_value()', function () {
                    it('should correctly change aria values', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        engineBootstrap.render()

                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuemin')).toBeNull()
                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuemax')).toBeNull()
                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuenow')).toBeNull()

                        engineBootstrap._handle_value('min', 0)
                        engineBootstrap._handle_value('max', 100)
                        engineBootstrap._handle_value('current', 50)

                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuemin')).toEqual('0')
                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuemax')).toEqual('100')
                        expect(engineBootstrap._$progressbar.getAttribute('aria-valuenow')).toEqual('50')
                    })

                    it('should correctly set the progressbar in an indeterminate mode', function () {
                        var engineBootstrap = new ModuleProgressBar.EngineBootstrap(document.body)

                        engineBootstrap.render()

                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('active')
                        expect(engineBootstrap._$progressbar.style.width).not.toEqual('100%')

                        engineBootstrap._handle_value('indeterminate', true)

                        expect(engineBootstrap._$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).toContain('active')
                        expect(engineBootstrap._$progressbar.style.width).toEqual('100%')

                        engineBootstrap._handle_value('indeterminate', false)

                        expect(engineBootstrap._$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap._$progressbar.classList).not.toContain('active')
                        expect(engineBootstrap._$progressbar.style.width).not.toEqual('100%')
                    })
                })
            })

            describe('EngineHtml5', function () {
                describe('constructor()', function () {
                    it('should call EngineInterface::constructor() and fail because $container is undefined nor an HTMLElement', function () {
                        expect(function () {
                            new ModuleProgressBar.EngineHtml5()
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))

                        expect(function () {
                            new ModuleProgressBar.EngineHtml5('foo')
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                    })

                    it('should assign « real » options with defaults options of the engine', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        expect(engineHtml5._options).toEqual({
                            'label_visible': true,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progression_visible': true,
                            'progression_format': '{{progress}}%',
                            'progression_position': 'right'
                        })
                    })

                    it('should merge « real » options, defaults options of the engine, with the user ones', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'label_visible': false,
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        expect(engineHtml5._options).toEqual({
                            'label_visible': false,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progression_visible': true,
                            'progression_format': 'Progression: {{progress}}%',
                            'progression_position': 'right'
                        })
                    })
                })

                describe('render()', function () {
                    it('should correctly call _create_elements() and _render_element()', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        spyOn(engineHtml5, '_create_elements')
                        spyOn(engineHtml5, '_render_elements')

                        engineHtml5.render()

                        expect(engineHtml5._create_elements).toHaveBeenCalled()
                        expect(engineHtml5._render_elements).toHaveBeenCalled()
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        engineHtml5.render()
                        engineHtml5.update_values({'min': 0, 'max': 100, 'current': 50})
                        engineHtml5._update_progression()

                        expect(engineHtml5._$progression.textContent).toEqual('Progression: 50%')
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'progresssion_format': 'Progression: {{progress}}%'
                        })

                        engineHtml5.render()
                        expect(engineHtml5._$label.textContent).toEqual('')

                        engineHtml5._update_label('foo')
                        expect(engineHtml5._$label.textContent).toEqual('foo')

                        engineHtml5._update_label()
                        expect(engineHtml5._$label.textContent).toEqual('')
                    })
                })

                describe('_create_elements()', function () {
                    it('should create elements by following the default behavior', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        engineHtml5._create_elements()

                        expect(engineHtml5._$progress).toEqual(jasmine.any(HTMLDivElement))
                        expect(engineHtml5._$progress.classList).toContain('progress')

                        expect(engineHtml5._$progressbar).toEqual(jasmine.any(HTMLProgressElement))
                        expect(engineHtml5._$progressbar.classList).toContain('progress-bar')

                        expect(engineHtml5._$progression).toEqual(jasmine.any(HTMLSpanElement))
                        expect(engineHtml5._$progression.style.display).not.toBe('none')

                        expect(engineHtml5._$label).toEqual(jasmine.any(HTMLSpanElement))
                        // Can't compare a DOMTokenList ($label.classList) to an array with .toEqual method
                        expect(engineHtml5._$label.className.split(' ')).toEqual(['progressbar-label'])
                        expect(engineHtml5._$label.style.display).not.toEqual('none')
                    })

                    it('the $progression should be screen-reader visible only', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'progression_visible': false
                        })

                        engineHtml5._create_elements()

                        expect(engineHtml5._$progression.style.display).toEqual('none')
                    })

                    it('the $label should not be visible ', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'label_visible': false
                        })

                        engineHtml5._create_elements()

                        expect(engineHtml5._$label.style.display).toEqual('none')
                    })
                })

                describe('_render_elements()', function () {
                    it('should render elements by following the default behavior', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        engineHtml5._create_elements()
                        engineHtml5._render_elements()

                        expect(engineHtml5._$progressbar.parentNode).toEqual(engineHtml5._$progress)
                        expect(engineHtml5._$progress.parentNode).toEqual(engineHtml5._$container)
                        expect(engineHtml5._$label.nextSibling).toEqual(engineHtml5._$progress)
                        expect(engineHtml5._$progressbar.nextSibling).toEqual(engineHtml5._$progression)
                    })

                    it('should render elements with $label at the bottom of the progress bar', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'label_position': 'bottom'
                        })

                        engineHtml5._create_elements()
                        engineHtml5._render_elements()

                        expect(engineHtml5._$progress.nextSibling).toEqual(engineHtml5._$label)
                    })

                    it('should render elements with $progression at the left of the progress bar', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body, {
                            'progression_position': 'left'
                        })

                        engineHtml5._create_elements()
                        engineHtml5._render_elements()

                        expect(engineHtml5._$progression.nextSibling).toEqual(engineHtml5._$progressbar)
                    })
                })

                describe('_handle_value()', function () {
                    it('should correctly change aria values', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        engineHtml5.render()

                        expect(engineHtml5._$progressbar.getAttribute('min')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('max')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('value')).toBeNull()

                        engineHtml5._handle_value('min', 0)
                        engineHtml5._handle_value('max', 100)
                        engineHtml5._handle_value('current', 50)

                        expect(engineHtml5._$progressbar.getAttribute('min')).toEqual('0')
                        expect(engineHtml5._$progressbar.getAttribute('max')).toEqual('100')
                        expect(engineHtml5._$progressbar.getAttribute('value')).toEqual('50')
                    })

                    it('should correctly set the progressbar in an indeterminate mode', function () {
                        var engineHtml5 = new ModuleProgressBar.EngineHtml5(document.body)

                        engineHtml5.render()

                        expect(engineHtml5._$progressbar.getAttribute('min')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('max')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('value')).toBeNull()

                        engineHtml5.update_values({'min': 0, 'max': 100, 'current': 50})

                        expect(engineHtml5._$progressbar.getAttribute('min')).toEqual('0')
                        expect(engineHtml5._$progressbar.getAttribute('max')).toEqual('100')
                        expect(engineHtml5._$progressbar.getAttribute('value')).toEqual('50')

                        engineHtml5._handle_value('indeterminate', true)

                        expect(engineHtml5._$progressbar.getAttribute('min')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('max')).toBeNull()
                        expect(engineHtml5._$progressbar.getAttribute('value')).toBeNull()

                        engineHtml5._handle_value('indeterminate', false)

                        expect(engineHtml5._$progressbar.getAttribute('min')).toEqual('0')
                        expect(engineHtml5._$progressbar.getAttribute('max')).toEqual('100')
                        expect(engineHtml5._$progressbar.getAttribute('value')).toEqual('50')
                    })
                })
            })
        })
    })
})