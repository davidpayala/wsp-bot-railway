import { loadContacts } from './conversations.js';
import { setupSendEvent } from './send.js';
import { loadMessages } from './messages.js';

function showMenu() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <div class="menu-icons">
            <button id="newMessageMenuIcon">Nuevo mensaje ✉️</button>
        </div>
    `;
}

export function showChat(number) {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <button id="closeChatButton">❌</button>
        <div id="messages" class="messages">
            <!-- Aquí se cargarán los mensajes -->
        </div>
        <div class="input-container">
            <input type="text" id="response" placeholder="Escribe tu mensaje...">
            <button id="sendButton">→</button>
        </div>
    `;
    setupSendEvent(); // Configura el envío de mensajes
    loadMessages(number); // Carga los mensajes del contacto
    document.getElementById('closeChatButton').addEventListener('click', showMenu);
}


let selectedNumber = null; // Variable para almacenar el contacto seleccionado

export function updateSelectedNumber(number) {
    selectedNumber = number;
}

export function getSelectedNumber() {
    return selectedNumber;
}

function initializeApp() {
    // Mostrar el menú al cargar la página
    showMenu();
    loadContacts(); // Cargar lista inicial de contactos en la barra lateral

    document.getElementById('menuButton').addEventListener('click', showMenu);
    document.getElementById('newMessageButton').addEventListener('click', () => {
        // Aquí puedes agregar la función de nuevo mensaje más adelante
        alert('Nuevo mensaje no implementado todavía');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp(); // Asegúrate de que `initializeApp` solo se llama cuando el DOM está listo
});


// Ejecutar la función de inicialización cuando la página se cargue
window.onload = initializeApp;
