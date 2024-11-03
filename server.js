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
 * Esta ruta obtiene todos los mensajes almacenados en la base de datos,
 * incluyendo la información del número de contacto, mensaje, marca de tiempo,
 * dirección (entrante/saliente) y el estado (leído o no leído). */
app.get('/get-messages', async (req, res) => {
    const messages = await db.query('SELECT number, message, timestamp, direction, estado FROM messages');
    res.json(messages);
});
/*
* Esta ruta actualiza el estado de los mensajes de un contacto específico a "leído".
* Se utiliza cuando el usuario abre la conversación de un contacto en la interfaz,
* marcando así los mensajes previos como leídos. */
app.post('/update-status', async (req, res) => {
    const { number } = req.body;
    await db.query('UPDATE messages SET estado = "leido" WHERE number = ? AND estado = "no_leido"', [number]);
    res.json({ success: true });
});

app.post('/receive-whatsapp', async (req, res) => {
    try {
        const { object, entry } = req.body
        if (object === 'whatsapp_business_account') {
            entry.forEach(async (entry) => {
                const changes = entry.changes
                changes.forEach(async (change) => {
                    const value = change.value
                    const messages = value.messages

                    if (messages) {
                        messages.forEach(async (message) => {
                            const number = message.from
                            const text = message.text?.body || null
                            const urlMedia = message.image?.url || null
                            await db.execute(
                                'INSERT INTO messages (number, message, urlMedia) VALUES (?, ?, ?)',
                                [number, text, urlMedia]
                            )
                            console.log(`Received message from ${number}: ${text}`)
                        })
                    }
                })
            })
        }

        res.status(200).send('EVENT_RECEIVED')
    } catch (error) {
        console.error('Error receiving WhatsApp message:', error)
        res.sendStatus(500)
    }
})

app.get('/get-messages', async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM messages ORDER BY timestamp DESC')
        res.status(200).json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Failed to fetch messages' })
    }
})

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
            // Almacenar el mensaje enviado en la base de datos
            await db.execute(
                'INSERT INTO messages (number, message, urlMedia, direction) VALUES (?, ?, ?, ?)',
                [number, response, null, 'outgoing']
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
