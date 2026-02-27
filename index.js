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
      // Öğrencinin socket id'sini veriye ekleyip öğretmene gönderiyoruz
      data.ogrenciSocketId = socket.id; 
      socket.to(data.roomId).emit('yoklama-tetikle', data);
  });
  
  // Öğretmenden (content.js) gelen başarı onayını öğrenciye ilet
  socket.on('yoklama-basarili-onay', (data) => {
      if (data.ogrenciSocketId) {
          io.to(data.ogrenciSocketId).emit('sisteme-islendi-onayi', {
              mesaj: "Yoklamanız okul sistemine başarıyla kaydedildi!"
          });
      }
  });

  socket.on('yoklamayi-bitir-herkese-duyur', () => {
      const roomId = Array.from(socket.rooms)[1]; 
      if(roomId) {
          // O odadaki herkese (öğrencilere de) "Bağlantıyı Kes" emri gönder
          io.to(roomId).emit('yoklama-durduruldu');
      }
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Sunucu ${PORT} üzerinde çalışıyor`);
});


