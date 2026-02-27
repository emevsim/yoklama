/*
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// CORS ayarlarını en güvenli ve açık hale getiriyoruz
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Tüm kökenlere (GitHub Pages dahil) izin ver
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Yoklama Sunucusu Aktif!');
});

io.on('connection', (socket) => {
  console.log('Kullanıcı bağlandı:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Oda katılımı: ${roomId}`);
  });

  socket.on('yoklama-gonder', (data) => {
    console.log('Yoklama verisi alındı:', data);
    // Veriyi odadaki diğerlerine (öğretmene) gönder
    socket.to(data.roomId).emit('yoklama-tetikle', data.ogrenciNo);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Sunucu ${PORT} üzerinde çalışıyor`);
});
*/



const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// IP adreslerini takip etmek için bir liste
const ipKayitlari = {}; 

io.on('connection', (socket) => {
    // Gerçek IP adresini alalım
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;

    socket.on('join-room', (roomId) => { socket.join(roomId); });

    socket.on('yoklama-gonder', (data) => {
        // IP KONTROLÜ
        if (ipKayitlari[clientIp] && ipKayitlari[clientIp] !== data.ogrenciNo) {
            socket.emit('hata-mesaji', 'Bu cihazdan/internet ağından zaten başka bir öğrenci yoklaması alındı!');
            return;
        }

        // IP ve No eşleşmesini kaydet
        ipKayitlari[clientIp] = data.ogrenciNo;
        
        console.log(`Onaylandı: ${data.ogrenciNo} (IP: ${clientIp})`);
        socket.to(data.roomId).emit('yoklama-tetikle', data.ogrenciNo);
        socket.emit('onay-mesaji', 'Yoklama başarıyla iletildi.');
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log("Sunucu hazir."));
