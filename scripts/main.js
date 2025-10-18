window.onload = async () => {
    const loading = document.getElementById("loading");

    try {
        // 1️⃣ Kamera izni
        await navigator.mediaDevices.getUserMedia({ video: true });

        // 2️⃣ Konum izni
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
            });
        });

        // 3️⃣ (iOS için) yön sensörü izni
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            // Bu satır sadece iOS için çalışır, kullanıcıdan dokunuş ister
            try {
                await DeviceOrientationEvent.requestPermission();
            } catch (err) {
                console.warn("Yön izni reddedildi veya gerekli değil:", err);
            }
        }

        // İzinler alındı, sahneyi başlat
        startARScene();
        loading.style.opacity = "0";
        setTimeout(() => (loading.style.display = "none"), 500);
    } catch (err) {
        loading.innerHTML = `<h2>❌ İzin alınamadı</h2><p>${err.message}</p>`;
        console.error("İzin hatası:", err);
    }
};

// 3D modeller
const models = [
    {
        name: "model1",
        lat: 37.01689233514004,
        lon: 35.83366570697778,
        file: "./models/model1.glb",
        scale: "5 5 5"
    },
];

function startARScene() {
    const scene = document.querySelector("a-scene");

    window.addEventListener("gps-camera-update-position", (event) => {
        if (scene.dataset.modelsAdded) return;
        scene.dataset.modelsAdded = true;

        models.forEach((item) => {
            const entity = document.createElement("a-entity");
            entity.setAttribute(
                "gps-entity-place",
                `latitude: ${item.lat}; longitude: ${item.lon};`
            );
            entity.setAttribute("gltf-model", `url(${item.file})`);
            entity.setAttribute("scale", item.scale);
            entity.setAttribute("animation-mixer", "");
            entity.setAttribute("look-at", "[gps-camera]");
            scene.appendChild(entity);
        });

        console.log("📍 Modeller sahneye eklendi!");
    });
}
