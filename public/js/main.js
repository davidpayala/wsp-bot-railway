let selectedNumber = null; // Variable local, no se exporta directamente

// Función para actualizar selectedNumber
export function updateSelectedNumber(number) {
    selectedNumber = number;
}

// Función para obtener el valor actual de selectedNumber
export function getSelectedNumber() {
    return selectedNumber;
}

// Resto del código de inicialización
import { loadContacts } from './conversations.js';
import { updateUnreadMessages } from './utils.js';
import { setupSendEvent } from './send.js';

function initializeApp() {
    loadContacts(); // Cargar lista de contactos
    setupSendEvent(); // Configura el evento para el envío de mensajes

    // Temporizador para actualizar contactos y mensajes no leídos cada 5 segundos
    setInterval(updateUnreadMessages, 5000);
}

// Ejecutar la función de inicialización cuando se cargue la página
window.onload = initializeApp;
