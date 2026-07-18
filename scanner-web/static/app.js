const s=status=document.getElementById('status'),n=document.getElementById('name'),p=document.getElementById('price');
let last='',time=0;
async function send(code){
const r=await fetch('/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:code})});
const d=await r.json();
if(d.success){s.textContent='✅';n.textContent=d.name;p.textContent=Number(d.price).toFixed(2)+' zł';navigator.vibrate&&navigator.vibrate(80);}
else{s.textContent='Nie znaleziono';n.textContent='Brak produktu';p.textContent='';}}
function ok(t){const now=Date.now();if(t===last&&now-time<1200)return;last=t;time=now;send(t);}
new Html5QrcodeScanner('reader',{fps:10,qrbox:{width:300,height:180}},false).render(ok,()=>{});