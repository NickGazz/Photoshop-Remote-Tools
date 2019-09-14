function main(socket){
    const toolsDiv = document.querySelector('#tools');
    tools = {};
    fetch('images/tools-sprite.svg')
    .then(res => res.text())
    .then(svgText => {
        const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
        svgDoc.querySelectorAll('symbol').forEach(symbol => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.innerHTML = symbol.innerHTML;
            svg.setAttribute('viewBox', symbol.getAttribute('viewBox'));
            svg.setAttribute('id', symbol.id);
            toolsDiv.appendChild(svg);
            tools[symbol.id] = svg;
            svg.addEventListener('click', (e) => {
                toolChange(symbol.id, true);
            });
        });
    }).catch(err => {console.error(err)});
    toolsDiv.style.display="";

    function toolChange(tool, emit = false){
        Object.values(tools).forEach(el => {
            el.classList.remove('selected');
        });
        tools[tool].classList.add('selected');
        if (emit) socket.emit('Tool Change', tool);
    }

    socket.on('Tool Change', tool => {
        toolChange(tool);
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