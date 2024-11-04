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
export async function markMessagesAsRead(number) {
    if (!number) {
        console.error("Número no proporcionado a markMessagesAsRead");
        return;
    }

    try {
        const response = await fetch('/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, estado: 'leido'  })
        });

        if (!response.ok) {
            console.error("Error al actualizar el estado:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error en la solicitud a /update-status:", error);
    }
}


// Seleccionar un Contacto y Cargar Mensajes
export async function selectContact(number) {
    updateSelectedNumber(number); // Actualiza el número seleccionado en main.js
    unreadContacts.delete(number); // Quita el contacto de no leídos

    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active', 'unread'));
    
    showChat(number); // Abre el chat
    await markMessagesAsRead(number); // Marcar mensajes como leídos solo para este chat
    loadMessages(number); // Cargar mensajes solo para el número seleccionado
}