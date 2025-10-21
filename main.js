// main.js - Sürekli konum isteği + smoothing + fallback poll
document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("cameraFeed");
    const model = document.getElementById("model1");
    const statusEl = document.getElementById("status");
    const latEl = document.getElementById("lat");
    const lonEl = document.getElementById("lon");
    const accEl = document.getElementById("acc");
    const speedEl = document.getElementById("speed");
    const warnEl = document.getElementById("warning");

    // Ayarlar
    const SMOOTH_ALPHA = 0.2;      // EMA sabiti (0..1) - küçük => daha yumuşak
    const POLL_INTERVAL = 1000;    // ms (watchPosition çalışmazsa fallback için)
    const MAX_ALLOWED_AGE = 2000;  // ms - konumun yaş kabul sınırı

    let smoothed = null;           // {lat, lon}
    let watchId = null;
    let lastTimestamp = 0;
    let pollTimer = null;

    // Debug helper
    function updateDebug(pos) {
        if (!pos) return;
        latEl.textContent = pos.coords.latitude.toFixed(6);
        lonEl.textContent = pos.coords.longitude.toFixed(6);
        accEl.textContent = (pos.coords.accuracy || '-').toString();
        speedEl.textContent = (pos.coords.speed != null ? pos.coords.speed.toFixed(2) : '-');
        statusEl.textContent = 'Konum alınıyor';
    }

    // EMA smoothing
    function smoothCoord(newLat, newLon) {
        if (!smoothed) {
            smoothed = { lat: newLat, lon: newLon };
            return smoothed;
        }
        smoothed.lat = SMOOTH_ALPHA * newLat + (1 - SMOOTH_ALPHA) * smoothed.lat;
        smoothed.lon = SMOOTH_ALPHA * newLon + (1 - SMOOTH_ALPHA) * smoothed.lon;
        return smoothed;
    }

    // Modelin gps-attribute'unu güncelle
    function updateModelPosition(lat, lon) {
        // A-Frame gps-entity-place bileşenini dinamik güncelleme
        model.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lon};`);
    }

    // Konum başarı handler
    function handlePositionSuccess(pos) {
        lastTimestamp = Date.now();
        updateDebug(pos);

        // Eğer doğruluk çok kötü ise bir uyarı göster
        if (pos.coords.accuracy && pos.coords.accuracy > 50) {
            warnEl.textContent = `GPS doğruluğu düşük (${Math.round(pos.coords.accuracy)} m). Daha iyi sinyal için açık alana çıkın.`;
        } else {
            warnEl.textContent = '';
        }

        // Smooth uygula ve modeli güncelle
        const s = smoothCoord(pos.coords.latitude, pos.coords.longitude);
        updateModelPosition(s.lat, s.lon);
    }

    // Konum hata handler
    function handlePositionError(err) {
        console.warn('Geolocation error:', err);
        statusEl.textContent = `Hata: ${err.message}`;
    }

    // watchPosition başlat
    function startWatch() {
        if (!('geolocation' in navigator)) {
            alert('Tarayıcınız konum özelliğini desteklemiyor.');
            statusEl.textContent = 'Konum desteklenmiyor';
            return;
        }

        try {
            watchId = navigator.geolocation.watchPosition(
                (pos) => handlePositionSuccess(pos),
                (err) => handlePositionError(err),
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            );
            statusEl.textContent = 'watchPosition aktif';
        } catch (e) {
            console.error('watchPosition başlatılamadı', e);
            statusEl.textContent = 'watchPosition hata';
        }

        // fallback poll: eğer watchPosition 3s içinde veri getirmezse getCurrentPosition ile periyodik al
        let fallbackStarted = false;
        setTimeout(() => {
            if (!lastTimestamp || (Date.now() - lastTimestamp) > 3000) {
                // watchPosition veri getirmiyorsa polling başlat
                fallbackStarted = true;
                statusEl.textContent = 'watchPosition veri getirmiyor, polling etkin';
                pollTimer = setInterval(() => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            // filtre: çok eski veri atla
                            if (Date.now() - pos.timestamp > MAX_ALLOWED_AGE) return;
                            handlePositionSuccess(pos);
                        },
                        (err) => handlePositionError(err),
                        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
                    );
                }, POLL_INTERVAL);
            }
        }, 3000);
    }

    // watch stop
    function stopWatch() {
        if (watchId != null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        if (pollTimer != null) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        statusEl.textContent = 'Konum durduruldu';
    }

    // Kamera başlatma (senin orijinal koda benzer)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        video.srcObject = stream;
        console.log('Kamera akışı başlatıldı');
    } catch (err) {
        console.error('Kamera izni alınamadı:', err);
        alert('Kamera izni verilmedi!');
        statusEl.textContent = 'Kamera izni yok';
        return;
    }

    // Konum izni ve başlat
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            // Başlangıç değeri alındıktan sonra watch başlat
            handlePositionSuccess(pos);
            startWatch();
        },
        (err) => {
            console.warn('İlk konum hatası:', err);
            handlePositionError(err);
            // yine de watch başlatmayı dene — bazı tarayıcılar ilkinde hata verebilir
            startWatch();
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // Sayfa kapanırken temizle
    window.addEventListener('beforeunload', () => {
        stopWatch();
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(t => t.stop());
        }
    });
});
