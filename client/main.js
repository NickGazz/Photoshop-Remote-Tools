var csInterface = new CSInterface();

// Start server 
path = csInterface.getSystemPath(SystemPath.EXTENSION);
csInterface.evalScript("new File('"+path+"/host/start_server').execute()");

let auth = window.cep.fs.readFile(path+'/client/auth_token').data;

const ws = io.connect('ws://localhost:8001', { query: { token: auth } });

document.querySelector('#request-code').addEventListener('click', () => {ws.emit('Request Token');} );

ws.on('New Token', (token) => {
    const qr = qrcode(0, 'L');
    qr.addData(token);
    qr.make();
    document.getElementById('placeHolder').innerHTML = qr.createImgTag();
});

const extensionId = csInterface.getExtensionID();

const eventSelect = 1936483188;

const registeredEvents = [eventSelect];

function Initialize(){
    try {
        const registerEvent = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
        registerEvent.extensionId = extensionId;
        registerEvent.data = registeredEvents.toString();
        csInterface.dispatchEvent(registerEvent);

    } catch (e) {
        alert(e);
    }
}

csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, event => {
    ws.emit('Tool Change', event);
});

Initialize();