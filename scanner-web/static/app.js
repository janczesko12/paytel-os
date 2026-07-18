const statusBox=document.getElementById("status");
const nameBox=document.getElementById("name");
const priceBox=document.getElementById("price");

let lastCode="";
let lastScan=0;

async function sendBarcode(barcode){

    try{

        statusBox.innerText="Sprawdzanie produktu...";

        const response=await fetch("/scan",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                barcode:barcode
            })

        });

        const data=await response.json();

        if(data.success){

            statusBox.innerText="✅ Zeskanowano";

            nameBox.innerText=data.name;

            priceBox.innerText=data.price.toFixed(2)+" zł";

            if(navigator.vibrate){
                navigator.vibrate(100);
            }

        }else{

            statusBox.innerText="❌ Produkt nie istnieje";

            nameBox.innerText="Brak produktu";

            priceBox.innerText="";

        }

    }catch(e){

        console.log(e);

        statusBox.innerText="Błąd połączenia";

    }

}

function onScan(decodedText){

    const now=Date.now();

    if(decodedText===lastCode && now-lastScan<1200){
        return;
    }

    lastCode=decodedText;
    lastScan=now;

    sendBarcode(decodedText);

}

const scanner=new Html5QrcodeScanner(

    "reader",

    {

        fps:10,

        qrbox:{
            width:280,
            height:160
        },

        rememberLastUsedCamera:true,

        supportedScanTypes:[
            Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]

    }

);

scanner.render(onScan);