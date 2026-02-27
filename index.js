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
