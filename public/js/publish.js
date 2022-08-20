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
    // Map options
    const startCoor = [-1.95, 30.0666]
    var map = L.map('map').setView([-1.95, 30.0666], 13)

    const leafLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
    )
    leafLayer.addTo(map)

    const googleSat = L.tileLayer(
        'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }
    )
    document.getElementById('satellite').addEventListener('click', () => {
        map.removeLayer(googleSat)
        googleSat.addTo(map)
    })
    document.getElementById('terrain').addEventListener('click', () => {
        map.removeLayer(leafLayer)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
    })
    const pointIconOptions = {
        iconUrl: 'image/icon.png',
        iconSize: [10, 10],
    }
    const locationIconOptions = {
        iconUrl: 'image/right.png',
        iconSize: [24, 24],
    }
    const pointIcon = L.icon(pointIconOptions)
    const locationIcon = L.icon(locationIconOptions)
    const pointMarkerOptions = {
        icon: pointIcon,
        draggable: false,
        title: 'Point',
    }
    const busMarkerOptions = {
        icon: locationIcon,
        title: 'Bus location',
    }
    const busMarker = L.marker(startCoor, busMarkerOptions)
        .addTo(map)
        .bindPopup(
            `<div class="popup">
            Waiting for info...
            </div>`
        )
        .openPopup()

    // Finish map
    let locationHistory = JSON.parse(localStorage.getItem('progres')) || []

    const token = localStorage.getItem('token') || 'insecure-1234'

    const link = `${window.location.protocol}//${window.location.host}`
    let socket = io({
        auth: {
            token: token,
        },
    })
    socket = socket.connect(link, {
        auth: {
            token: 'hello',
        },
    })
    let locWatch
    let finished
    let ongoing
    const seats = 60
    let passengers = 0
    document.getElementById('start').addEventListener('click', () => {
        if (locWatch) {
            $.notify('Already on the way', 'info')
            return
        }
        let boarded
        while (!boarded) {
            boarded = prompt('How many passengers boarded the bus')
            if (isNaN(boarded)) {
                boarded = null
                $.notify('Must be a number')
            }
        }

        passengers = parseInt(boarded)
        socket.emit('bus_stop', {
            alerted: 0,
            boarded: parseInt(boarded),
            seats,
            passengers,
            available: seats - passengers,
        })
        $.notify('Journey initiated succesfully', 'success')
        if ('geolocation' in navigator) {
            console.log('I can get the location')
            $('#start').text('Watching')
            ongoing = true
            locWatch = navigator.geolocation.watchPosition(
                (position) => {
                    const locObj = {
                        position: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                        accuracy: position.coords.accuracy,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        sentAt: position.timestamp,
                    }
                    socket.emit('location_update', locObj)
                    document.getElementById(
                        'current'
                    ).innerText = `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
                    locationHistory.push(locObj)
                },
                (err) => {
                    console.log(err)
                    ongoing = false
                    $.notify('Something went wrong')
                },
                {
                    maximumAge: 0,
                    enableHighAccuracy: true,
                }
            )
        } else {
            $.notify('Change the device to send real time location', 'error')
            locationHistory = []
            $('#start').text('No location service')
            $('#stop').text('No location service')
            $('#finish').text('No location service')
        }
    })
    document.getElementById('stop').addEventListener('click', () => {
        console.log(locWatch)
        if (locWatch) {
            $('#start').hide()
            $('#stop').text('Alert/Stop')
            let alerted, boarded
            while (!alerted) {
                alerted = prompt('How many passengers alerted the bus')
                if (isNaN(alerted)) {
                    $.notify('Must be a number')
                    alerted = null
                }
            }
            while (!boarded) {
                boarded = prompt('How many passengers boarded the bus')
                if (isNaN(boarded)) {
                    $.notify('Must be a number')
                    boarded = null
                }
            }
            passengers = passengers + parseInt(boarded) - parseInt(alerted)
            let available = seats - passengers
            if (available < 0) {
                available = 0
            }
            socket.emit('bus_stop', {
                alerted,
                boarded,
                passengers,
                available,
            })
            $.notify('Update sent', 'info')
        }
    })
    document.getElementById('finish').addEventListener('click', () => {
        if (locWatch && locationHistory.length > 0) {
            const st = confirm('Are you sure, this will stop sending location')
            if (st) {
                navigator.geolocation.clearWatch(locWatch)
                document.getElementById('current').innerText = 'Finished'
                $('#start').text('Journey Ended')
                $('#start').text('Journey Ended')
                finishedJourney = true
                socket.emit('finished', {
                    time: new Date(),
                    record: locationHistory,
                })
                ongoing = false
                finishedJourney = true
                localStorage.removeItem('progres')
                locationHistory = []
                $.notify('Trip completed', 'info')
            }
        } else {
            locationHistory = []
            $.notify('No trip on the way', 'info')
        }
    })

    socket.on('disconnect', (err) => {
        handleState.disconnect()
        $('#loading').show()
    })
    socket.on('connect', (err) => {
        handleState.connect()
        $('#loading').hide()
    })
    socket.io.on('reconnect', (e) => {
        console.log('Reconnected')
    })

    socket.io.on('reconnect_attempt', (e) => {
        console.log('Reconnecting')
    })
    onbeforeunload = (event) => {
        if (!ongoing && locationHistory.length > 0) {
            localStorage.setItem('progress', JSON.stringify(locationHistory))
        }
        if (ongoing) {
            return 'Are you sure? The trip will be affected'
        }
    }
})
