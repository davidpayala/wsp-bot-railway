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

    contacts.forEach(contact => createContactElement(contact, sidebar));
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

// Seleccionar un contacto y cargar sus mensajes
export function selectContact(number) {
    updateSelectedNumber(number); // Actualiza el contacto seleccionado en main.js
    unreadContacts.delete(number); // Quita el contacto de no leídos
    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active', 'unread'));
    loadMessages(number); // Cargar mensajes del contacto seleccionado
}
