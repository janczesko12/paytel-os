const video = document.getElementById("video");
const status = document.getElementById("status");

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        status.innerText = "✅ Kamera działa";

    } catch (e) {
        status.innerText = "❌ " + e.name;
        console.error(e);
    }
}

startCamera();
