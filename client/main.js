var csInterface = new CSInterface();

// Start server 
path = csInterface.getSystemPath(SystemPath.EXTENSION);
csInterface.evalScript("new File('"+path+"/host/start_server').execute()");

let auth = window.cep.fs.readFile(path+'/client/auth_token').data;

const ws = io.connect('ws://192.168.1.146:8001', { query: { token: auth } });

document.querySelector('#request-code').addEventListener('click', () => {ws.emit('Request Token');} );
ws.on('New Token', (token) => {
    const qr = qrcode(0, 'L');
    qr.addData(token);
    qr.make();
    document.getElementById('placeHolder').innerHTML = qr.createImgTag();
});