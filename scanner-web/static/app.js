const status = document.getElementById("status");
const nameBox = document.getElementById("name");
const priceBox = document.getElementById("price");

let lastCode = "";
let lastScan = 0;

async function sendBarcode(barcode){

    try{

        status.innerText="Wysyłanie...";

        const response = await fetch("/scan",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                barcode:barcode
            })

        });

        const data = await response.json();

        if(data.success){

            status.innerText="✅ Zeskanowano";

            nameBox.innerText=data.name;
            priceBox.innerText=data.price.toFixed(2)+" zł";

            if(navigator.vibrate){
                navigator.vibrate(100);
            }

        }else{

            status.innerText="❌ Nie znaleziono";

            nameBox.innerText="Brak produktu";
            priceBox.innerText="";

        }

    }catch(e){

        console.log(e);

        status.innerText="Błąd połączenia";

    }

}

function onScanSuccess(decodedText){

    const now=Date.now();

    if(decodedText===lastCode && now-lastScan<1000){
        return;
    }

    lastCode=decodedText;
    lastScan=now;

    status.innerText=decodedText;

    sendBarcode(decodedText);

}

const scanner = new Html5QrcodeScanner(
    "reader",
    {
        fps:10,
        qrbox:{
            width:300,
            height:180
        },
        formatsToSupport:[
            Html5QrcodeSupportedFormats.EAN_13
        ]
    },
    false
);

scanner.render(onScanSuccess);