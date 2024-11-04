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
    setupSendEvent(); // Configura el envío de mensajes aquí, cuando los elementos ya están en el DOM
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
        alert('Nuevo mensaje no implementado todavía');
    });
    
    // Configurar un intervalo para verificar nuevos mensajes
    setInterval(checkForNewMessages, 5000); // Verificar cada 5 segundos
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp(); // Asegúrate de que `initializeApp` solo se llama cuando el DOM está listo
});

async function checkForNewMessages() {
    const selectedNumber = getSelectedNumber(); // Obtiene el contacto actual

    if (!selectedNumber) {
        return; // Si no hay un contacto seleccionado, no hace nada
    }

    try {
        const response = await fetch(`/get-messages?number=${selectedNumber}`);
        const messages = await response.json();

        const messagesDiv = document.getElementById('messages');
        if (messagesDiv && messages.length) {
            messagesDiv.innerHTML = ''; // Limpiar mensajes actuales

            messages.forEach(msg => {
                const msgElement = document.createElement('div');
                msgElement.classList.add('message', msg.direction === 'outgoing' ? 'outgoing' : 'incoming');
                msgElement.innerHTML = `<p>${msg.message}</p><span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>`;
                messagesDiv.appendChild(msgElement);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar al final
        }
    } catch (error) {
        console.error("Error al verificar nuevos mensajes:", error);
    }
}


// Ejecutar la función de inicialización cuando la página se cargue
window.onload = initializeApp;
