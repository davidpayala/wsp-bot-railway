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
        const lastMessage = messages.find(msg => msg.number === contact && msg.estado === 'no_leido');
        createContactElement(contact, sidebar, lastMessage?.estado === 'no_leido');
    });
}

// Crear un elemento de contacto en la barra lateral
function createContactElement(contact, sidebar, hasUnread) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contact');
    contactElement.textContent = contact;
    contactElement.onclick = () => selectContact(contact);

    const unreadIndicator = document.createElement('span');
    unreadIndicator.classList.add('unread-indicator');

    if (hasUnread) {
        contactElement.classList.add('unread');
    }

    sidebar.appendChild(contactElement);
}


// Crear un elemento de contacto en la barra lateral
function createContactElement(contact, sidebar) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contact');
    contactElement.textContent = contact;
    contactElement.onclick = () => selectContact(contact);

    const unreadIndicator = document.createElement('span');
    unreadIndicator.classList.add('unread-indicator');
    contactElement.appendChild(unreadIndicator);

    if (unreadContacts.has(contact)) {
        contactElement.classList.add('unread');
    }

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
    updateSelectedNumber(number); // Actualiza el contacto seleccionado en main.js
    unreadContacts.delete(number); // Quita el contacto de no leídos
    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active', 'unread'));
    
    // Marcar mensajes como leídos en la base de datos
    await markMessagesAsRead(number);

    loadMessages(number); // Cargar mensajes del contacto seleccionado
}