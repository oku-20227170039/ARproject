window.onload = () => {
    const loading = document.getElementById('loading');

    // Modellerin konum listesi
    const models = [
        {
            name: "model1",
            lat: 37.01689233514004,
            lon: 35.83366570697778,
            file: "./models/model1.glb",
            scale: "5 5 5"
        },
    ];

    // Konum izni alındığında modelleri sahneye ekle
    window.addEventListener('gps-camera-update-position', (event) => {
        const scene = document.querySelector('a-scene');

        if (scene.dataset.modelsAdded) return; // bir kere ekle
        scene.dataset.modelsAdded = true;

        models.forEach((item) => {
            const entity = document.createElement('a-entity');
            entity.setAttribute('gps-entity-place', `latitude: ${item.lat}; longitude: ${item.lon};`);
            entity.setAttribute('gltf-model', `url(${item.file})`);
            entity.setAttribute('scale', item.scale);
            entity.setAttribute('animation-mixer', '');
            entity.setAttribute('look-at', '[gps-camera]');
            scene.appendChild(entity);
        });

        loading.style.display = 'none';
        console.log("📍 Modeller sahneye eklendi!");
    });
};
