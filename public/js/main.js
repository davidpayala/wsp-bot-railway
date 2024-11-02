import { loadContacts } from './conversations.js';
import { updateUnreadMessages } from './utils.js';
import { setupSendEvent } from './send.js';

// Variable global para el contacto seleccionado
export let selectedNumber = null;

// Inicializar la aplicación
function initializeApp() {
    loadContacts(); // Cargar lista de contactos
    setupSendEvent(); // Configura el evento para el envío de mensajes

    // Temporizador para actualizar contactos y mensajes no leídos cada 5 segundos
    setInterval(updateUnreadMessages, 5000);
}

// Ejecutar la función de inicialización cuando se cargue la página
window.onload = initializeApp;
