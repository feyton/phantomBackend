$(document).ready(() => {
    const handleState = {
        disconnect: (state = 'Disconnected') => {
            document.getElementById('status').innerText = state
            document.getElementById('status').className = 'inactive'
        },
        connect: (state = 'Connected') => {
            document.getElementById('status').innerText = state
            document.getElementById('status').className = 'active'
        },
    }
    const link = `${window.location.protocol}//${window.location.host}`
    const socket = io.connect(link)
    const locTrack = []
    socket.on('location_update', (data) => {
        document.getElementById(
            'current'
        ).innerText = `lat: ${data.latitude}, lon: ${data.longitude}`
        document.getElementById('latest').innerText = `lat: ${
            locTrack[-1]?.latitude
        }, lon: ${locTrack[-1]?.longitude}`
        console.log(data)
        locTrack.push(data.position)
    })

    socket.on('bus_update', (data) => {
        $('.boarded').text(data.boarded)
        $('.alerted').text(data.alerted)
        $('.seats').text(data.seats)
    })

    socket.on('disconnect', (err) => {
        console.log('Lost connection')
        handleState.disconnect()
        $('#loading').show()
    })
    socket.on('connect', (err) => {
        console.log('Lost connection')
        handleState.connect()
        $('#loading').hide()
    })
    socket.io.on('reconnect', (e) => {
        console.log(e)
        console.log('Reconnected')
    })

    socket.io.on('reconnect_attempt', (e) => {
        console.log(e)
        console.log('Reconnecting')
    })
})
