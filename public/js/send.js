import { loadMessages } from './messages.js';
import { selectedNumber } from './main.js';

// Configura el evento para enviar mensajes al presionar Enter o hacer clic en el botón
export function setupSendEvent() {
    document.getElementById('response').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('sendButton').addEventListener('click', sendMessage);
}

// Enviar el mensaje y actualizar el estado en función de la respuesta
export async function sendMessage() {
    const responseText = document.getElementById('response').value;

    if (!selectedNumber || !responseText) {
        alert('Please select a contact and enter a message.');
        return;
    }

    // Mostrar el mensaje en el chat de inmediato
    const messagesDiv = document.getElementById('messages');
    const tempMessage = document.createElement('div');
    tempMessage.classList.add('message', 'outgoing');
    tempMessage.innerHTML = `<p>${responseText}</p><span class="time status">Sending...</span>`;
    messagesDiv.appendChild(tempMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    document.getElementById('response').value = ''; // Limpiar campo de entrada

    // Intentar enviar el mensaje al servidor
    const res = await fetch('/send-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: selectedNumber, response: responseText })
    });

    // Actualizar el estado del mensaje
    const statusElement = tempMessage.querySelector('.status');
    if (res.ok) {
        statusElement.textContent = '✔'; // Check enviado
        statusElement.classList.add('sent');
    } else {
        statusElement.textContent = '✖'; // X roja
        statusElement.classList.add('failed');
    }
}
