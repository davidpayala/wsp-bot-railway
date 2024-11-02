import { loadContacts } from './conversations.js';
import { updateUnreadMessages } from './utils.js';
import { setupSendEvent } from './send.js';

// Variable para el contacto seleccionado (inicialmente null)
let selectedNumber = null;

// Función para actualizar el contacto seleccionado
export function updateSelectedNumber(number) {
    selectedNumber = number;
}

// Función para obtener el valor del contacto seleccionado
export function getSelectedNumber() {
    return selectedNumber;
}

// Inicializar la aplicación
function initializeApp() {
    loadContacts(); // Cargar lista de contactos
    setupSendEvent(); // Configura el evento para el envío de mensajes

    // Configura un intervalo para actualizar mensajes y contactos no leídos cada 5 segundos
    setInterval(updateUnreadMessages, 5000);
}

// Ejecutar la función de inicialización cuando se cargue la página
window.onload = initializeApp;
