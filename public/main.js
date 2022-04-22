$(document).ready(() => {
    const link = `${window.location.protocol}//${window.location.host}`
    const socket = io.connect(link)
    socket.on('location_update', (data) => {
        console.log('From server', data)
    })
})
