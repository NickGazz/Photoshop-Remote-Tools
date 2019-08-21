var csInterface = new CSInterface();

// Start server 
path = csInterface.getSystemPath(SystemPath.EXTENSION);
csInterface.evalScript("new File('"+path+"/host/start_server').execute()");

let auth = window.cep.fs.readFile(path+'/client/jwt').data;

const ws = io.connect('ws://192.168.1.146:8001', { query: { token: auth } });


ws.send('Hi');
ws.emit('customeEvent', 'This is a test event');

ws.emit('message', 'Test message');