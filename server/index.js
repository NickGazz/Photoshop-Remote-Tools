'user strict';

const express = require('express')
const app = express();
const SocketIO = require('socket.io');
require('dotenv').config(__dirname+'/.env');

const PORT = process.env.PORT || 8000;

const io = new SocketIO( app.listen(PORT, ()=>{
    console.log(`Listening on Port: ${PORT}`);
}));

app.get('/', (req, res) => {
    res.send('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js"></script>');
});

class Room{
    constructor(user, passphrase, socket, isPS = false){
        this.room = user;
        this.passphrase = passphrase;
        this.sockets = [socket];
        this.photoshopConnected = isPS;
        this.currentTool = undefined;
    }
}
let rooms = {}

const authenticateUser = (socket) => new Promise( (resolve,reject) =>{
    socket.once('authenticate', data => {
        const {user, pass, isPS} = data;
        if ( !rooms.hasOwnProperty(user) ){
            rooms[user] = new Room(user, pass, socket)
        } else if ( pass !== rooms[user].passphrase ){
            reject('Invalid credentials')
        } else {
            rooms[user].sockets.push(socket);
        }
        resolve(user);
    });
    // Reject auth after 2 minutes without a response
    setTimeout(() => {reject('Auth timed out');}, 120000);
});

io.on('connection', async socket => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));

    // wait for user to send auth credentials before allowing connection;
    let room = await authenticateUser(socket).then(room => room)
        .catch(err => { socket.disconnect(true); });

    socket.join(room);
    socket.on('Tool Change', tool => {
        socket.to(room).emit('Tool Change', tool);
    });

});