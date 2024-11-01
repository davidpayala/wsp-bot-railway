// server.js
import express from 'express'
import fetch from 'node-fetch'
import db from './db.js'


// Crear una instancia de Express
const app = express()
const PORT = process.env.PORT || 3000

// Middleware para interpretar JSON en las solicitudes
app.use(express.json())

// 1. Verificar el Webhook de WhatsApp Business
app.get('/receive-whatsapp', (req, res) => {
    const verifyToken = process.env.VERIFY_TOKEN

    // Verificar el token de suscripción del webhook
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully!')
        res.status(200).send(challenge)
    } else {
        res.status(403).send('Verification failed')
    }
})

// 2. Recibir y almacenar mensajes de WhatsApp
app.post('/receive-whatsapp', async (req, res) => {
    try {
        const { object, entry } = req.body

        // Verificar que la solicitud proviene de un mensaje de WhatsApp
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

                            // Almacenar el mensaje en la base de datos
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

// 3. Leer mensajes almacenados
app.get('/get-messages', async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM messages ORDER BY timestamp DESC')
        res.status(200).json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Failed to fetch messages' })
    }
})

// 4. Enviar una respuesta manual a un mensaje de WhatsApp
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
