window.onload = () => {
    const scene = document.querySelector('a-scene');
    const statusEl = document.getElementById('status');

    statusEl.innerHTML = 'Kamera ve Konum izni bekleniyor... Lütfen izin verin.';

    // AR.js, GPS'ten ilk stabil konumu aldığında bu olay tetiklenir.
    // Modelleri eklemek için en doğru yer burasıdır.
    window.addEventListener('gps-camera-update-position', (event) => {
        // Modellerin sadece bir kez (ilk GPS sinyalinde) eklenmesini sağlıyoruz
        if (scene.dataset.modelsAdded) {
            // İlk yüklemeden sonra sadece konumu güncelleyelim
            const pos = event.detail.position;
            statusEl.innerHTML = `Konum: ${pos.latitude.toFixed(6)}, ${pos.longitude.toFixed(6)}`;
            return;
        }

        statusEl.innerHTML = '✅ GPS Sinyali Alındı! Modeller yükleniyor...';
        console.log("GPS ve Kamera hazır:", event.detail.position);

        // 1. SİZİN MODELİNİZ (Belirlediğiniz sabit koordinatta)
        const model1 = {
            name: "model1",
            lat: 37.01689233514004,
            lon: 35.83366570697778,
            file: "./models/model1.glb",
            scale: "5 5 5"
        };

        const entity = document.createElement('a-entity');
        entity.setAttribute('gps-entity-place', `latitude: ${model1.lat}; longitude: ${model1.lon};`);
        entity.setAttribute('gltf-model', `url(${model1.file})`);
        entity.setAttribute('scale', model1.scale);
        entity.setAttribute('look-at', '[gps-camera]'); // Modelin size bakmasını sağlar
        entity.setAttribute('animation-mixer', ''); // Varsa animasyonu oynatır
        scene.appendChild(entity);


        // 2. TEST MODELİ (Sizin şu anki konumunuza)
        // Bu, kodun çalıştığını ama diğer modelin uzakta olduğunu anlamanızı sağlar.
        // Bulunduğunuz yerin 10 metre kuzeyine kırmızı bir kutu ekleyelim.
        const userPos = event.detail.position;
        const testLat = userPos.latitude + 0.0001; // ~11 metre kuzey
        const testLon = userPos.longitude;

        const testBox = document.createElement('a-box');
        testBox.setAttribute('color', 'red');
        testBox.setAttribute('scale', '3 3 3');
        testBox.setAttribute('gps-entity-place', `latitude: ${testLat}; longitude: ${testLon};`);
        testBox.setAttribute('look-at', '[gps-camera]');
        scene.appendChild(testBox);

        console.log(`✅ Test küpü şu konuma eklendi: ${testLat}, ${testLon}`);

        // Modellerin eklendiğini işaretliyoruz
        scene.dataset.modelsAdded = true;
    });

    // AR.js bir hata verirse (örn. kamera izni reddedilirse)
    // 'arjs-device-error' olayını dinleyebilirsiniz.
    scene.addEventListener('arjs-device-error', (event) => {
        statusEl.innerHTML = 'Cihaz hatası (Kamera veya Konum engellenmiş olabilir).';
        console.error("AR.js Hatası:", event);
        alert("Kamera veya konum iznini vermediniz. Lütfen izinleri sıfırlayıp sayfayı yenileyin.");
    });
};