const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" } // Güvenlik için her yerden gelen isteğe izin veriyoruz (test için)
});

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);

  // Öğretmen bir "oda" oluşturur (Ders ID'sine göre)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Cihaz ${roomId} odasına katıldı.`);
  });

  // Öğrenciden gelen yoklama verisi
  socket.on('yoklama-gonder', (data) => {
    // data: { roomId: 'mat101', ogrenciNo: '12345' }
    console.log(`Yoklama alındı: ${data.ogrenciNo}`);
    
    // Aynı odadaki öğretmene bu veriyi ilet
    socket.to(data.roomId).emit('yoklama-tetikle', data.ogrenciNo);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı.');
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});
