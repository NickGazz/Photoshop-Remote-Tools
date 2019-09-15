var csInterface = new CSInterface();

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

function socketEvents(socket){
    csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, event => {
        let data = JSON.parse(event.data.replace('ver1,', ''));
        let tool = data.eventData.null._ref;
        socket.emit('Tool Change', tool);
    });
    
    socket.on('Tool Change', test => {
        csInterface.evalScript(`app.currentTool='${test}'`);
    });
}

document.querySelector('#credentials-form').addEventListener('submit', (e) => {
    e.preventDefault();
    formFields = e.target.children;
    const socket = io.connect('ws://photoshop-remote-tools.herokuapp.com');
    socket.on('connect', () =>{
        socket.emit('authenticate', {
            user: formFields.user.value,
            pass: formFields.pass.value,
            isPS: true
        });
        socket.once('authenticated', () =>{
            csInterface.evalScript(`app.currentTool`, (tool) => {
                socket.emit('Tool Change', tool);
            });
            // Remove connect form once authenticated
            e.target.style.display = 'none';
            socket.on('dissconnect', () => {
                e.target.style.display = '';
            });
            socketEvents(socket);
        });
    });
});

Initialize();