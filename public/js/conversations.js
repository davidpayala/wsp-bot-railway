import { loadMessages } from './messages.js';
import { updateSelectedNumber, showChat } from './main.js';

export const unreadContacts = new Set(); // Almacena los contactos con mensajes no leídos

// Cargar los contactos y mostrarlos en la barra lateral
export async function loadContacts() {
    const response = await fetch('/get-messages');
    const messages = await response.json();
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.innerHTML = ''; // Limpiar solo la lista de contactos

    const contacts = Array.from(new Set(messages.map(msg => msg.number)));
    contacts.forEach(contact => {
        const lastMessage = messages.find(msg => msg.number === contact);
        const hasUnread = lastMessage && lastMessage.estado === 'no_leido';
        createContactElement(contact, contactsContainer, hasUnread);
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
    updateSelectedNumber(number); // Actualiza el contacto seleccionado en main.js
    unreadContacts.delete(number); // Elimina de los no leídos

    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active', 'unread'));
    
    // Llamar a `showChat` para abrir la interfaz de chat
    showChat(number);

    // Marcar mensajes como leídos
    await markMessagesAsRead(number);

    // Cargar mensajes
    loadMessages(number);
}