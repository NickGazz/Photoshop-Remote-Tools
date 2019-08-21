'user strict';

const fs = require('fs');
const ssl = {
    key: fs.readFileSync(__dirname + '/sslcert/ssl.key'),
    cert: fs.readFileSync(__dirname + '/sslcert/ssl.cert')
};
const express = require('express')
const app = express();
const http = require('http').Server();
const https = require('https').Server({key: ssl.key, cert: ssl.cert}, app);
const socketServer = require('socket.io');
require('dotenv').config(__dirname+'/.env');
const PORT = process.env.PORT || 8000;
const jwt = require('jsonwebtoken');
const JWTKEY = process.env.JWTKEY || 'my_secret_key';

// SSL server for remote client controlling photoshop
const io = new socketServer(https);
// Proxy server added to support photoshop's inability to connect 
const proxyIO = new socketServer(http);

proxyIO.on('connection', (socket) => {
});

app.get('/', (req, res) => {
    res.send('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js"></script>');
});

// Create jwt and save to client folder for photoshop to use for auth
(() => {
    try {
        jwt.sign( {id: "Photoshop Host"}, JWTKEY, { audience: "PS WebSocket Server", expiresIn:'1h'}, (err, token) => {
            if (err) throw err;
            fs.writeFile(__dirname+'/../client/jwt', token, (err) => { if (err) throw err; } );
        });
    } catch (error) {
        console.log(error)    ;
    }
})();

// Authenticate jwt sent with socket handshake
const authenticateToken = (socket, next) => {
    try {
        //Get token from cookie or query string
        token = (() => {
            // return auth cookie if it exists
            if ( socket.request.headers.hasOwnProperty('cookie') && request.headers.cookie.indexOf('auth=') >= 0 ){
                return socket.request.headers.cookie.match(/[; ]?auth=([^; ]*)/)[1]
            }
            // otherwise return auth query if it exists or throw an error if it doesnt
            return socket.handshake.query.token;
        })();
        //returns decoded message if valid, otherwise throws an error
        decoded = jwt.verify(token, JWTKEY, { audience: 'PS WebSocket Server'});

        // Create isPhotoshop propery on sokcet and set to true if the jwt id is photoshop
        socket.isPhotoshop = (decoded.id === 'Photoshop Host');
        next();
    } catch (error) {
        console.log(error);
        // if token doesn't exists or is invalid disconnect the socket
        socket.disconnect();
    }
}

io.use( authenticateToken );
proxyIO.use( authenticateToken );

proxyIO.on('connection', (socket) => {
    socket.send('Hello');
    // socket.on('message', (message) => console.log(message));
    if ( socket.isPhotoshop ) {
        // TODO: Set-up listeners and functions specific to the photoshop socket
    }
});

io.on('connection', (socket) => {
    socket.send('Hello');
    socket.on('message', (message) => console.log(message));
    if ( socket.isPhotoshop ) {
        // TODO: Set-up listeners and functions specific to the photoshop socket
    }
});


https.listen(PORT, ()=>{
    console.log('listening on port ' + PORT);
});
http.listen(8001, () => {
    console.log('listening on port 8001');
});