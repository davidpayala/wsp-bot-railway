// db.js
import mysql from 'mysql2/promise'

// Crear una conexión de pool a la base de datos MySQL
const db = await mysql.createPool({
    host: process.env.DB_HOST,       // Host de la base de datos MySQL
    user: process.env.DB_USER,       // Usuario de MySQL
    password: process.env.DB_PASSWORD, // Contraseña de MySQL
    database: process.env.DB_NAME,   // Nombre de la base de datos MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default db
