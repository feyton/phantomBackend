$(document).ready(() => {
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
        console.log(data)
        const updatedCoor = new L.LatLng(data.lat, data.lon)
        L.marker(updatedCoor, pointMarkerOptions).addTo(map)
        busMarker.setLatLng(updatedCoor)
        locTrack.push(data.position)
    })

    socket.on('bus_update', (data) => {
        busMarker._popup.setContent(`
        <div class="popup">
        <p>Boarded: ${data.boarded}</p>
        <p>Alerted: ${data.alerted}</p>
        <p>Available seats: ${data.available}</p>
        </div>
        `)
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
    socket.on('bus_finished', (data) => {
        console.log(data)
        busMarker._popup.setContent(`
        <div class="popup">
        <p>Bus completed trip at:
        
        </p>
        <p> ${new Date(data.time).toLocaleString('en-GB')}</p>
        </div>
        
        `)
    })
})
