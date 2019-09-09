const connectButton = document.querySelector('#connect');
const tools = document.querySelector('#tools');

connectButton.addEventListener('click', establishConnection);

function establishConnection(){
    const socket = io.connect('wss://192.168.1.146:8000');
    socket.on('connect', () => main(socket));
    socket.on('Tool Change', tool => {
        Array.from(tools.children).forEach(el => {
            el.style.background="";
        });
        tools.querySelector(`#${tool}`).style.background="blue";
        // console.log(data);
    });
}

function displayTools(){
}

function main(socket){
    connectButton.style.display = 'none';
    tools.style.display = '';

    tools.addEventListener('click', function(e){
        console.log(e.target.id);
        socket.emit('Tool Change', `${e.target.id}`);
    });
    

}