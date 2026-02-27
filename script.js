// Render'dan aldığın sunucu URL'sini buraya yapıştır
const socket = io("https://yoklama-sunucu.onrender.com");

// URL'deki ?room=ders101 kısmını yakalar
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || 'genel-oda';

function yoklamaGonder() {
    const ogrenciNo = document.getElementById('ogrenciNo').value;
    const status = document.getElementById('status');
    const btn = document.getElementById('submitBtn');

    if (!ogrenciNo) {
        alert("Lütfen öğrenci numaranızı girin!");
        return;
    }

    // Butonu geçici olarak devre dışı bırak
    btn.disabled = true;
    status.innerText = "Gönderiliyor...";
    status.className = "text-blue-600";

    // Sunucuya veriyi gönder
    socket.emit('yoklama-gonder', {
        roomId: roomId,
        ogrenciNo: ogrenciNo
    });

    // Başarılı mesajı
    setTimeout(() => {
        status.innerText = "Yoklama bilgisi iletildi!";
        status.className = "text-green-600";
        btn.disabled = false;
    }, 1000);
}
