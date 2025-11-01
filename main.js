document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("cameraFeed");
    const model = document.getElementById("model1");
    const statusEl = document.getElementById("status");
    const latEl = document.getElementById("lat");
    const lonEl = document.getElementById("lon");
    const accEl = document.getElementById("acc");
    const speedEl = document.getElementById("speed");
    const warnEl = document.getElementById("warning");

    const startButton = document.getElementById("startAR");


    startButton.addEventListener("click", async () => {
        startButton.style.display = "none"; // butonu gizle

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            video.srcObject = stream;
            statusEl.textContent = "Kamera aktif";
        } catch (err) {
            alert("Kamera izni verilmedi!");
            statusEl.textContent = "Kamera izni reddedildi";
            return;
        }

        // Şimdi konum izni iste
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log("Konum alındı");
                // Buradan itibaren senin mevcut konum ve model kodun devam edebilir
                startTracking(pos);
            },
            (err) => {
                alert("Konum izni verilmedi veya alınamadı.");
                console.error(err);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });


    // Ayarlar (yüksek frekanslı güncelleme)
    const POLL_INTERVAL = 200;
    const MAX_ALLOWED_AGE = 500;

    // Kalman filtreleri
    const kfLat = new KalmanFilter({ R: 0.01, Q: 3 });
    const kfLon = new KalmanFilter({ R: 0.01, Q: 3 });

    let lastTimestamp = 0;
    let pollTimer = null;

    // Kamera başlat
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        video.srcObject = stream;
        statusEl.textContent = 'Kamera aktif';
    } catch (err) {
        alert('Kamera izni verilmedi!');
        statusEl.textContent = 'Kamera izni yok';
        return;
    }

    // Wake lock (ekran kapanmasın)
    if ('wakeLock' in navigator) {
        try {
            await navigator.wakeLock.request('screen');
            console.log('Ekran açık kalacak.');
        } catch (err) {
            console.warn('WakeLock başarısız:', err);
        }
    }

    // GPS konumunu işle
    function handlePosition(pos) {
        lastTimestamp = Date.now();
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const lat = kfLat.filter(latitude);
        const lon = kfLon.filter(longitude);

        latEl.textContent = lat.toFixed(6);
        lonEl.textContent = lon.toFixed(6);
        accEl.textContent = accuracy ? accuracy.toFixed(1) : '-';
        speedEl.textContent = speed ? speed.toFixed(2) : '-';

        if (accuracy > 50) {
            warnEl.textContent = `GPS doğruluğu düşük (${Math.round(accuracy)} m)`;
        } else {
            warnEl.textContent = '';
        }

        // Modeli stabilize et (GPS konumuna göre)
        model.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lon};`);
    }

    function handleError(err) {
        console.warn('Konum hatası:', err);
        statusEl.textContent = `Hata: ${err.message}`;
    }

    // Konum izleme
    function startTracking() {
        statusEl.textContent = 'Konum izleniyor';
        navigator.geolocation.watchPosition(handlePosition, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        pollTimer = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (Date.now() - pos.timestamp > MAX_ALLOWED_AGE) return;
                    handlePosition(pos);
                },
                handleError,
                { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 }
            );
        }, POLL_INTERVAL);
    }

    // Manyetik yön (kompas) dinle
    window.addEventListener('deviceorientationabsolute', (e) => {
        if (e.alpha !== null) {
            const cam = document.querySelector('a-camera');
            cam.setAttribute('rotation', { x: 0, y: 360 - e.alpha, z: 0 });
        }
    });

    // Başlat
    navigator.geolocation.getCurrentPosition(
        (pos) => { handlePosition(pos); startTracking(); },
        (err) => { handleError(err); startTracking(); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // Sayfa kapanırken temizle
    window.addEventListener('beforeunload', () => {
        if (pollTimer) clearInterval(pollTimer);
        if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    });
});
