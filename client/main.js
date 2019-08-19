var csInterface = new CSInterface();

// Start server 
path = csInterface.getSystemPath(SystemPath.EXTENSION);
csInterface.evalScript("new File('"+path+"/host/start_server').execute()");

let auth = window.cep.fs.readFile(path+'/client-ps/jwt').data;

ws = new WebSocket('ws://127.0.0.1:8006/?auth='+auth);

ws.onmessage = (message) => {
    alert(message.data);
}

ws.send('Hi');
ws.emit('customeEvent', 'This is a test event');

ws.emit('message', 'Test message');