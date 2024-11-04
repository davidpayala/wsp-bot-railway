import express from 'express'
import fetch from 'node-fetch'
import db from './src/db.js'


const app = express()
const PORT = process.env.PORT || 3000

// Middleware para interpretar JSON en las solicitudes
app.use(express.json())

// Configurar el servidor para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'))

// Rutas de la API
app.get('/receive-whatsapp', (req, res) => {
    const verifyToken = process.env.VERIFY_TOKEN
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === verifyToken) {
        res.status(200).send(challenge)
    } else {
        res.status(403).send('Verification failed')
    }
})


/*
* Esta ruta actualiza el estado de los mensajes de un contacto específico a "leído".
* Se utiliza cuando el usuario abre la conversación de un contacto en la interfaz,
* marcando así los mensajes previos como leídos. */
app.post('/update-status', async (req, res) => {
    const { number, estado } = req.body;

    // Validación de parámetros
    if (!number || !estado) {
        return res.status(400).json({ error: "Número o estado no proporcionado" });
    }

    try {
        // Actualizar el estado en la tabla `chat_status` para el número especificado
        await db.execute(`
            UPDATE chat_status
            SET estado = ?, last_message = NOW()
            WHERE number = ?
        `, [estado, number]);

        res.json({ success: true });
    } catch (error) {
        console.error("Error al actualizar el estado del chat:", error);
        res.status(500).json({ error: "Error al actualizar el estado del chat" });
    }
});


app.post('/receive-whatsapp', async (req, res) => {
    try {
        const { object, entry } = req.body;
        if (object === 'whatsapp_business_account') {
            entry.forEach(async (entry) => {
                const changes = entry.changes;
                changes.forEach(async (change) => {
                    const value = change.value;
                    const messages = value.messages;

                    if (messages) {
                        messages.forEach(async (message) => {
                            const number = message.from;
                            const text = message.text?.body || null;
                            const urlMedia = message.image?.url || null;

                            // Guardar el mensaje entrante en la base de datos
                            await db.execute(
                                'INSERT INTO messages (number, message, urlMedia, direction, timestamp) VALUES (?, ?, ?, ?, NOW())',
                                [number, text, urlMedia, 'incoming']
                            );
                            // Actualizar o establecer el estado a "no_leido" en chat_status
                            await db.execute(
                                `
                                INSERT INTO chat_status (number, estado, last_message)
                                VALUES (?, 'no_leido', NOW())
                                ON DUPLICATE KEY UPDATE estado = 'no_leido', last_message = NOW()
                                `,
                                [number]
                            );
                        });
                    }
                });
            });
        }

        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error('Error receiving WhatsApp message:', error);
        res.sendStatus(500);
    }
});

/*
 * Esta ruta obtiene todos los mensajes almacenados en la base de datos,
 * incluyendo la información del número de contacto, mensaje, marca de tiempo,
 * dirección (entrante/saliente) y el estado (leído o no leído). */

 app.get('/get-messages', async (req, res) => {
    const { number } = req.query;

    try {
        let query;
        let params;

        // Si se proporciona un número, filtrar solo los mensajes de ese número
        if (number) {
            query = `
                SELECT m.number, m.message, m.timestamp, m.direction, cs.estado
                FROM messages AS m
                LEFT JOIN chat_status AS cs ON m.number = cs.number
                WHERE m.number = ?
                ORDER BY m.timestamp ASC
            `;
            params = [number];
        } else {
            // Si no hay número, obtener todos los mensajes
            query = `
                SELECT m.number, m.message, m.timestamp, m.direction, cs.estado
                FROM messages AS m
                LEFT JOIN chat_status AS cs ON m.number = cs.number
                ORDER BY m.timestamp DESC
            `;
            params = [];
        }

        // Ejecutar la consulta con los parámetros adecuados
        const [messages] = await db.execute(query, params);

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


// Ruta para enviar una respuesta manual a un mensaje de WhatsApp
app.post('/send-response', async (req, res) => {
    const { number, response } = req.body

    try {
        const accessToken = process.env.ACCESS_TOKEN
        const phoneNumberId = process.env.PHONE_NUMBER_ID

        // URL de la API de WhatsApp para enviar mensajes
        const url = `https://graph.facebook.com/v13.0/${phoneNumberId}/messages`

        const payload = {
            messaging_product: 'whatsapp',
            to: number,
            text: { body: response }
        }

        // Enviar la respuesta al usuario
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await apiResponse.json()
        if (apiResponse.ok) {
            // Almacenar el mensaje enviado en la tabla messages
            await db.execute(
                'INSERT INTO messages (number, message, urlMedia, direction) VALUES (?, ?, ?, ?)',
                [number, response, null, 'outgoing']
            )

            // Actualizar la tabla chat_status con el estado y la fecha del último mensaje
            await db.execute(
                `
                INSERT INTO chat_status (number, estado, last_message)
                VALUES (?, 'no_leido', NOW())
                ON DUPLICATE KEY UPDATE last_message = NOW(), estado = 'no_leido'
                `,
                [number]
            )

            res.status(200).json({ status: 'Response sent successfully', data })
        } else {
            console.error('Error sending response:', data)
            res.status(500).json({ error: 'Failed to send response', details: data })
        }
    } catch (error) {
        console.error('Error sending response:', error)
        res.status(500).json({ error: 'Failed to send response' })
    }
})

// Iniciar el servidor y escuchar en el puerto definido
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
