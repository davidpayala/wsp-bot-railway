// Cargar mensajes para el contacto seleccionado
export async function loadMessages(number) {
    const response = await fetch(`/get-messages?number=${number}`);
    const messages = await response.json();
    const messagesDiv = document.getElementById('messages');

    // Verificar si el contenedor de mensajes existe
    if (!messagesDiv) {
        console.error("El elemento con id 'messages' no se encontró en el DOM.");
        return;
    }

    messagesDiv.innerHTML = ''; // Limpiar mensajes actuales

    let lastDate = null;

    messages.forEach(msg => {
        const messageDate = new Date(msg.timestamp).toLocaleDateString();

        if (messageDate !== lastDate) {
            const dateDivider = document.createElement('div');
            dateDivider.classList.add('date-divider');
            dateDivider.textContent = messageDate;
            messagesDiv.appendChild(dateDivider);
            lastDate = messageDate;
        }

        const msgElement = document.createElement('div');
        msgElement.classList.add('message', msg.direction === 'outgoing' ? 'outgoing' : 'incoming');

        // Mostrar texto o imagen según el tipo de contenido
        if (msg.urlMedia) {
            const imgElement = document.createElement('img');
            imgElement.src = msg.urlMedia;
            imgElement.alt = 'Imagen recibida';
            imgElement.classList.add('received-image');
            msgElement.appendChild(imgElement);
        } else {
            const textElement = document.createElement('p');
            textElement.textContent = msg.message;
            msgElement.appendChild(textElement);
        }

        // Agregar la hora del mensaje
        const timeElement = document.createElement('span');
        timeElement.classList.add('time');
        timeElement.textContent = new Date(msg.timestamp).toLocaleTimeString();
        msgElement.appendChild(timeElement);

        messagesDiv.appendChild(msgElement);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar al final
}
