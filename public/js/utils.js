import { unreadContacts, loadContacts } from './conversations.js';
import { loadMessages } from './messages.js';
import { selectedNumber } from './main.js';

// Actualizar automáticamente mensajes y contactos no leídos cada 5 segundos
export async function updateUnreadMessages() {
    const response = await fetch('/get-messages');
    const messages = await response.json();

    messages.forEach(msg => {
        if (!unreadContacts.has(msg.number) && msg.direction === 'incoming' && msg.number !== selectedNumber) {
            unreadContacts.add(msg.number);
        }
    });

    loadContacts();
    if (selectedNumber) {
        loadMessages(selectedNumber);
    }
}
