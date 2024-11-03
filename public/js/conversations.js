import { loadMessages } from './messages.js';
import { updateSelectedNumber } from './main.js';

export const unreadContacts = new Set(); // Almacena los contactos con mensajes no leídos

// Cargar los contactos y mostrarlos en la barra lateral
export async function loadContacts() {
    const response = await fetch('/get-messages');
    const messages = await response.json();
    const contacts = Array.from(new Set(messages.map(msg => msg.number)));
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '<h2>Chats</h2>'; // Limpiar contactos actuales

    contacts.forEach(contact => {
        const lastMessage = messages.find(msg => msg.number === contact);
        const hasUnread = lastMessage && lastMessage.estado === 'no_leido';
        createContactElement(contact, sidebar, hasUnread);
    });
}

// Crear un elemento de contacto en la barra lateral
function createContactElement(contact, sidebar, hasUnread) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contact');
    contactElement.textContent = contact;
    contactElement.onclick = () => selectContact(contact);

    // Indicador de no leído (círculo rojo)
    const unreadIndicator = document.createElement('span');
    unreadIndicator.classList.add('unread-indicator');
    if (hasUnread) {
        unreadIndicator.style.display = 'inline-block'; // Mostrar el indicador si hay mensajes no leídos
    } else {
        unreadIndicator.style.display = 'none'; // Ocultar el indicador si no hay mensajes no leídos
    }

    contactElement.appendChild(unreadIndicator);
    sidebar.appendChild(contactElement);
}



// Función para actualizar el estado de los mensajes a "leído"
async function markMessagesAsRead(number) {
    await fetch('/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number })
    });
}

// Seleccionar un Contacto y Cargar Mensajes
export async function selectContact(number) {
    // 1. Actualiza el contacto seleccionado en main.js
    updateSelectedNumber(number);
    
    // 2. Elimina el contacto de la lista de no leídos (si existe)
    unreadContacts.delete(number);
    
    // 3. Limpia el estado "active" y "unread" de otros contactos en la interfaz
    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active', 'unread'));
    
    // 4. Marca los mensajes como leídos en la base de datos, usando la tabla `chat_status`
    await markMessagesAsRead(number);

    // 5. Cargar los mensajes del contacto seleccionado en la interfaz de chat
    loadMessages(number);
}
