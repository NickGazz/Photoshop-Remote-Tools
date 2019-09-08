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
const crypto = require('crypto');

let nonces = [];
const psNonce = crypto.randomBytes(16).toString('base64');
fs.writeFile(__dirname+'/../client/auth_token', psNonce, (err) => { if (err) throw err; } );

// SSL server for remote client controlling photoshop
const io = new socketServer(https);
// Proxy server added to support photoshop's inability to connect 
const proxyIO = new socketServer(http);

app.get('/', (req, res) => {
    res.send('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js"></script>');
});

// Authenticate token sent with socket handshake
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
        if ( !nonces.includes(token) && token !== psNonce ) throw Error('invalid token');
        // Create isPhotoshop propery on sokcet and set to true if the nonce is the one used for photoshop
        socket.isPhotoshop = (token === psNonce);
        next();
    } catch (error) {
        console.log(error);
        // if token doesn't exists or is invalid disconnect the socket
        socket.disconnect();
    }
}

io.use( authenticateToken );
proxyIO.use( authenticateToken );

function socketConnection(socket){

    if ( socket.isPhotoshop ) {
        console.log('Connected to Photoshop Socket');

        socket.on('Request Token', () => {
            let nonce = crypto.randomBytes(16).toString('base64');
            nonces.push(nonce);            
            socket.emit('New Token', nonce );
        });
    } else {
        console.log('Connected to remote socket');
        
    }
    socket.on('Tool Change', data => {
        io.emit('Tool Change', data);
        proxyIO.emit('Tool Change', data);
    });
}

proxyIO.on('connection', socketConnection);
io.on('connection', socketConnection);


https.listen(PORT, ()=>{
    console.log('listening on port ' + PORT);
});
http.listen(8001, () => {
    console.log('listening on port 8001');
});