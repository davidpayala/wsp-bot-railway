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

    try {
        // Intentar enviar el mensaje al servidor
        const res = await fetch('/send-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: selectedNumber, response: responseText })
        });

        // Actualizar el estado del mensaje
        const statusElement = tempMessage.querySelector('.status');
        if (res.ok) {
            // Si el mensaje se envió correctamente
            statusElement.textContent = '✔';
        } else if (res.status === 401 || res.status === 403) {
            // Si hay un problema de autenticación
            statusElement.textContent = 'Error de autenticación';
            showError("Error de autenticación: verifica el token de acceso.");
        } else {
            // Otros errores
            statusElement.textContent = '✖';
            showError("Error al enviar el mensaje. Inténtalo nuevamente.");
        }
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        const statusElement = tempMessage.querySelector('.status');
        statusElement.textContent = 'Error de conexión';
        showError("No se pudo conectar con el servidor. Verifica la conexión.");
    }
}

// Función para mostrar mensajes de error en la interfaz
function showError(message) {
    const chatContainer = document.getElementById('chat-container');
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;

    chatContainer.insertBefore(errorDiv, chatContainer.firstChild);

    // Ocultar el mensaje después de unos segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
