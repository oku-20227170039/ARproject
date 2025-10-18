window.onload = () => {
    // 1️⃣ Kamera izni iste
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            console.log("📸 Kamera izni verildi");
            startGeolocation();
        })
        .catch((err) => {
            alert("Kamera izni verilmedi veya desteklenmiyor!");
            console.error(err);
        });

    // 2️⃣ Konum izni iste
    function startGeolocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    console.log("📍 Konum alındı:", pos.coords);
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
    }

    // 3️⃣ AR modelini sahneye ekle
    function startAR() {
        const scene = document.querySelector("a-scene");
        const model = {
            name: "model1",
            lat: 37.051526,
            lon: 36.226987,
            file: "./models/model1.glb",
            scale: "5 5 5"
        };

        window.addEventListener("gps-camera-update-position", () => {
            if (scene.dataset.modelAdded) return;
            scene.dataset.modelAdded = true;

            const entity = document.createElement("a-entity");
            entity.setAttribute(
                "gps-entity-place",
                `latitude: ${model.lat}; longitude: ${model.lon};`
            );
            entity.setAttribute("gltf-model", `url(${model.file})`);
            entity.setAttribute("scale", model.scale);
            entity.setAttribute("look-at", "[gps-camera]");
            scene.appendChild(entity);

            console.log("✅ Model sahneye eklendi!");
        });
    }
};
