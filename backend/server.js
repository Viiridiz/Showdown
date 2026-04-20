const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

app.use('/api/teams', require('./src/routes/teamRoutes'));

app.use('/api/slots', require('./src/routes/buildSlotRoutes'));

app.get('/', (req, res) => {
    res.send('Showdown API is up');
});


//websockets
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

app.set('io', io);

// listen for live connections
io.on('connection', (socket) => {
    console.log('A wild user connected:', socket.id);

    // we will broadcast total active users
    io.emit('presence:update', io.engine.clientsCount);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('presence:update', io.engine.clientsCount);
    });
});

// CRITICAL: change app.listen to server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
