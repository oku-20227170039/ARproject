window.onload = async () => {

    // 1️⃣ Kamera izni bloğu TAMAMEN KALDIRILDI.
    // AR.js 'sourceType: webcam' ile bu izni zaten kendisi isteyecek.

    // 2️⃣ Konum izni
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log("📍 Konum alındı:", pos.coords);
                // Konum alındıktan sonra AR fonksiyonunu başlat
                startAR();
            },
            (err) => {
                alert("Konum izni reddedildi!");
                console.error(err);
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Tarayıcı konum desteği sunmuyor!");
    }

    // 3️⃣ AR modelleri sahneye ekleme
    function startAR() {
        const scene = document.querySelector('a-scene');
        const models = [
            {
                name: "model1",
                lat: 37.01689233514004,
                lon: 35.83366570697778,
                file: "./models/model1.glb",
                scale: "5 5 5"
            },
        ];

        // Bu event, AR.js kamerası ve GPS hazır olduğunda tetiklenir
        window.addEventListener('gps-camera-update-position', (e) => {
            // Modellerin sadece bir kez eklenmesini sağla
            if (scene.dataset.modelsAdded) return;
            scene.dataset.modelsAdded = true;

            console.log("GPS ve Kamera hazır. Modeller ekleniyor...");
            console.log("Mevcut konumunuz:", e.detail.position);

            models.forEach((item) => {
                const entity = document.createElement('a-entity');
                // gps-entity-place enlem ve boylam bekler
                entity.setAttribute('gps-entity-place', `latitude: ${item.lat}; longitude: ${item.lon};`);
                entity.setAttribute('gltf-model', `url(${item.file})`);
                entity.setAttribute('scale', item.scale);
                entity.setAttribute('animation-mixer', '');
                entity.setAttribute('look-at', '[gps-camera]'); // Modelin her zaman kullanıcıya bakmasını sağlar
                scene.appendChild(entity);
            });

            console.log("✅ Modeller sahneye eklendi!");
        });
    }
};