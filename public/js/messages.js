// Cargar mensajes para el contacto seleccionado
export async function loadMessages(number) {
    // Hacer la solicitud al servidor con el número del contacto
    const response = await fetch(`/get-messages?number=${number}`);
    const messages = await response.json();
    const messagesDiv = document.getElementById('messages');

    // Verificar si el contenedor de mensajes existe
    if (!messagesDiv) {
        console.error("El elemento con id 'messages' no se encontró en el DOM.");
        return;
    }

    messagesDiv.innerHTML = ''; // Limpiar mensajes actuales

    // Ordenar los mensajes por fecha y agruparlos por día
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
        msgElement.innerHTML = `<p>${msg.message}</p><span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>`;
        messagesDiv.appendChild(msgElement);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar al final
}

