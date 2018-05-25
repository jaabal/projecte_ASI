require(['tws/tornadowebsocket-es6'], function (TornadoWebSocket) {
    'use strict'

    let $status = document.querySelector('#status')
    let $response = document.querySelector('#response')
    let $form = document.querySelector('#form')
    let $message = $form.querySelector('input[type="text"]')

    let ws = new TornadoWebSocket('/echo', {
        host: 'kocal.fr'
    })

    function setStatus(status) {
        $status.textContent = status
    }

    ws.on('open', (event) => {
        setStatus('Open')

        $form.classList.remove('hide')
        $form.addEventListener('submit', (e) => {
            e.preventDefault()

            ws.emit('message', {
                message: $message.value
            })
        })
    })

    ws.on('close', (event) => {
        setStatus('Server is closed or port 8000 is blocked in your firewall. Open your console.')
        console.log(event)
    })

    ws.on('error', (event) => {
        setStatus('Error. Open your console.')
        console.log(event)
    })

    ws.on('new_message', (data) => {
        $response.textContent = data.message
    })
})
