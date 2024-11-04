import { loadContacts } from './conversations.js';
import { setupSendEvent } from './send.js';

function showMenu() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <div class="menu-icons">
            <button id="newMessageMenuIcon">Nuevo mensaje ✉️</button>
        </div>
    `;
}

function showChat(number) {
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
export function updateSelectedNumber(number) {
    selectedNumber = number;
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

// Ejecutar la función de inicialización cuando la página se cargue
window.onload = initializeApp;
