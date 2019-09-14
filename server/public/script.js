function main(socket){
    const tools = document.querySelector('#tools');

    tools.style.display = '';
    
    tools.addEventListener('click', function(e){
        socket.emit('Tool Change', `${e.target.id}`);
    });

    socket.on('Tool Change', tool => {
        Array.from(tools.children).forEach(el => {
            el.classList.remove('selected');
        });
        tools.querySelector(`#${tool}`).classList.add('selected');
    });
}

document.querySelector('#credentials-form').addEventListener('submit', e => {
    e.preventDefault();
    const formFields = e.target.children;
    const socket = io.connect();
    socket.on('connect', () => {
        socket.emit('authenticate', {
            user: formFields.user.value,
            pass: formFields.pass.value
        });
        socket.on('authenticated', ()=>{
            e.target.style.display = 'none';
            socket.on('dissconnect', () => {
                e.target.style.display = '';
            });
            // displayTools();
            main(socket);
        });
    });
});