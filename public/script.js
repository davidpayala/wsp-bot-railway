let selectedNumber = null;

// Cargar los contactos únicos (números) y mostrarlos como pestañas en la barra lateral
async function loadContacts() {
    const response = await fetch('/get-messages');
    const messages = await response.json();
    const contacts = Array.from(new Set(messages.map(msg => msg.number)));
    const sidebar = document.getElementById('sidebar');

    sidebar.innerHTML = '<h2>Chats</h2>'; // Limpiar contenido actual de contactos

    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.classList.add('contact');
        contactElement.textContent = contact;
        contactElement.onclick = () => selectContact(contact);
        sidebar.appendChild(contactElement);
    });
}

// Seleccionar un contacto y cargar los mensajes correspondientes
async function selectContact(number) {
    selectedNumber = number;
    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active'));
    event.target.classList.add('active');
    loadMessages(number);
}

// Cargar mensajes para el contacto seleccionado
async function loadMessages(number) {
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

        // Agregar divisor de fecha si el día cambia
        if (messageDate !== lastDate) {
            const dateDivider = document.createElement('div');
            dateDivider.classList.add('date-divider');
            dateDivider.textContent = messageDate;
            messagesDiv.appendChild(dateDivider);
            lastDate = messageDate;
        }

        const msgElement = document.createElement('div');
        msgElement.classList.add('message', msg.direction === 'outgoing' ? 'outgoing' : 'incoming');

        msgElement.innerHTML = `
            <p>${msg.message}</p>
            <span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
        `;
        messagesDiv.appendChild(msgElement);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll al final
}

// Enviar una respuesta y guardar en la base de datos
document.getElementById('sendButton').addEventListener('click', async () => {
    const responseText = document.getElementById('response').value;

    if (!selectedNumber || !responseText) {
        alert('Please select a contact and enter a message.');
        return;
    }

    const res = await fetch('/send-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: selectedNumber, response: responseText })
    });

    if (res.ok) {
        document.getElementById('response').value = ''; // Limpiar campo de respuesta
        loadMessages(selectedNumber); // Recargar mensajes para ver el nuevo mensaje
    } else {
        alert('Failed to send message.');
    }
});

// Actualizar automáticamente los mensajes cada 5 segundos
setInterval(() => {
    if (selectedNumber) {
        loadMessages(selectedNumber);
    }
}, 5000); // 5000 ms = 5 segundos

// Cargar contactos y mensajes al cargar la página
window.onload = loadContacts;
