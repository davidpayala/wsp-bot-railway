// Cargar mensajes para el contacto seleccionado
export async function loadMessages(number) {
    const response = await fetch('/get-messages');
    const messages = await response.json();
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Limpiar mensajes actuales

    const filteredMessages = messages
        .filter(msg => msg.number === number)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let lastDate = null;

    filteredMessages.forEach(msg => {
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
