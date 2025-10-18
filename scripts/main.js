const models = [
    {
        name: "model1",
        lat: 37.01689233514004,
        lon: 35.83366570697778,
        file: "./models/model1.glb",
        scale: "5 5 5"
    },
];

// Başlatma butonuna tıklanınca izinleri iste
document.getElementById("startAR").addEventListener("click", async () => {
    try {
        // Kamera izni iste
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Konum izni iste
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
            });
        });

        // iOS / Safari için yön (device orientation) izni iste
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== "granted") throw new Error("Yön izni reddedildi");
        }

        // Tüm izinler alındıysa
        document.getElementById("permissions").style.display = "none";
        startARScene();

    } catch (err) {
        alert("Gerekli izinler alınamadı: " + err.message);
        console.error(err);
    }
});

// AR sahnesini başlat ve modelleri yükle
function startARScene() {
    const scene = document.querySelector("a-scene");

    window.addEventListener("gps-camera-update-position", (event) => {
        if (scene.dataset.modelsAdded) return;
        scene.dataset.modelsAdded = true;

        models.forEach((item) => {
            const entity = document.createElement("a-entity");
            entity.setAttribute("gps-entity-place", `latitude: ${item.lat}; longitude: ${item.lon};`);
            entity.setAttribute("gltf-model", `url(${item.file})`);
            entity.setAttribute("scale", item.scale);
            entity.setAttribute("animation-mixer", "");
            entity.setAttribute("look-at", "[gps-camera]");
            scene.appendChild(entity);
        });

        console.log("📍 Modeller sahneye eklendi!");
    });
}
