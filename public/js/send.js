import { getSelectedNumber } from './main.js';


// Configura el evento para enviar mensajes y actualizar el estado a "leído" al escribir
export function setupSendEvent() {
    const responseInput = document.getElementById('response');

    // Cambiar el estado a "leído" cuando el usuario empieza a escribir en el campo de entrada
    responseInput.addEventListener('input', async () => {
        const number = getSelectedNumber(); // Obtener el número del chat actualmente abierto

        if (number) {
            // Enviar una solicitud para actualizar el estado a "leído" en la base de datos
            await fetch('/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number, estado: 'leido' })
            });
        }
    });

    // Enviar mensaje al presionar Enter
    responseInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    // Enviar mensaje al hacer clic en el botón de enviar
    document.getElementById('sendButton').addEventListener('click', sendMessage);
}
// Enviar el mensaje y actualizar el estado en función de la respuesta
export async function sendMessage() {
    const responseText = document.getElementById('response').value;
    const selectedNumber = getSelectedNumber();

    if (!selectedNumber || !responseText) {
        alert('Selecciona un contacto y escribe un mensaje.');
        return;
    }

    // Mostrar el mensaje en el chat de inmediato
    const messagesDiv = document.getElementById('messages');
    const tempMessage = document.createElement('div');
    tempMessage.classList.add('message', 'outgoing');
    tempMessage.innerHTML = `<p>${responseText}</p><span class="time status">Enviando...</span>`;
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
    statusElement.textContent = res.ok ? '✔' : '✖'; // Actualiza a check o X según el resultado
}
