const video = document.getElementById("video");

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                }
            },
            audio: false
        });

        video.srcObject = stream;

        await video.play();

        alert("✅ Kamera działa");

    } catch (e) {
        alert(e.name + "\n" + e.message);
        console.error(e);
    }
}

startCamera();
