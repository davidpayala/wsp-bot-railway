import { loadMessages } from './messages.js';
import { updateSelectedNumber, showChat } from './main.js';

export const unreadContacts = new Set(); // Almacena los contactos con mensajes no leídos

// Cargar los contactos y mostrarlos en la barra lateral
export async function loadContacts() {
    // Obtener contactos y estado de lectura
    const response = await fetch('/get-contacts'); // Cambiamos el endpoint para obtener contactos con estado
    const contactsData = await response.json();
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.innerHTML = ''; // Limpiar lista de contactos

    // Ordenar contactos por `last_message` de más reciente a más antiguo
    const sortedContacts = contactsData.sort((a, b) => new Date(b.last_message) - new Date(a.last_message));

    // Crear cada elemento de contacto en la barra lateral
    sortedContacts.forEach(contactData => {
        const { number, estado } = contactData;
        const hasUnread = estado === 'no_leido';
        createContactElement(number, contactsContainer, hasUnread);
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
    unreadIndicator.style.display = hasUnread ? 'inline-block' : 'none';

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
