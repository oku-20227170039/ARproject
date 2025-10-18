document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");

    startButton.addEventListener("click", async () => {
        startButton.style.display = "none"; // butonu gizle

        try {
            // Kamera izni iste
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            console.log("Kamera izni verildi ✅");

            // Konum izni iste (ileride GPS tabanlı sabitleme için kullanılabilir)
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        console.log("Konum alındı:", pos.coords.latitude, pos.coords.longitude);
                    },
                    (err) => {
                        console.warn("Konum hatası:", err.message);
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                console.warn("Tarayıcı konum servisini desteklemiyor.");
            }

            // WebXR destek kontrolü
            if (navigator.xr) {
                console.log("WebXR destekleniyor ✅");
            } else {
                alert("Bu cihaz WebXR desteklemiyor. Lütfen ARCore/ARKit uyumlu bir cihaz kullanın.");
            }
        } catch (err) {
            console.error("İzin alınamadı ❌", err);
            alert("Kamera erişim izni verilmedi!");
            startButton.style.display = "block";
        }
    });
});
