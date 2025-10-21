document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("cameraFeed");

    try {
        // 📍 Konum izni iste
        if (!("geolocation" in navigator)) {
            alert("Tarayıcınız konum özelliğini desteklemiyor.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log("Konum alındı:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.warn("Konum hatası:", err.message);
            },
            { enableHighAccuracy: true }
        );

        // 📸 Kamera izni iste
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
        console.log("Kamera akışı başlatıldı");

    } catch (err) {
        console.error("İzin alınamadı:", err);
        alert("Kamera veya konum izni verilmedi!");
    }
});
