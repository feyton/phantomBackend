$(document).ready(() => {
    const link = `${window.location.protocol}//${window.location.host}`
    const socket = io.connect(link)
    console.log(socket)
    let numbers = 60

    let numInterval
    var isPaused = true

    const host = window.location.host
    numInterval = setInterval(() => {
        if (!isPaused) {
            numbers--
            document.getElementById('current').innerText = numbers
            socket.emit('location_update', {
                location: numbers,
            })
            if (numbers < 0) {
                console.log('Cleared')
                clearInterval(numInterval)
            }
        }
    }, 1000)
    document.getElementById('start').addEventListener('click', () => {
        isPaused = false
        console.log('Started')
    })
    document.getElementById('stop').addEventListener('click', () => {
        isPaused = true

        console.log('Stop')
    })
    document.getElementById('finish').addEventListener('click', () => {
        if (numInterval !== null) {
            clearInterval(numInterval)
        }
        document.getElementById('current').innerText = 'Finished'

        console.log('finish')
    })
})
