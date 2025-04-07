const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

// Configure file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const app = express();
const server = require('http').createServer(app);
const io = socketio(server);

// Email configuration (using Mailtrap for testing)
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'your-mailtrap-user',
    pass: 'your-mailtrap-pass'
  }
});

// Store messages in memory (for demo purposes)
const messages = {};

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    filePath: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname
  });
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    await transporter.sendMail({
      from: '"Private Text App" <no-reply@privatetext.com>',
      to,
      subject,
      text
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('private message', ({ from, to, text }) => {
    const message = {
      from,
      text,
      timestamp: new Date().toISOString()
    };
    
    if (!messages[to]) messages[to] = [];
    messages[to].push(message);
    
    // Send to recipient if they're connected
    io.to(to).emit('private message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));