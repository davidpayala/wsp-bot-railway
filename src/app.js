import express from 'express'
import {pool} from './db.js'
import { readFile } from 'fs/promises'
import {PORT} from './config.js'
const app = express()



// Función que lee y ejecuta un archivo SQL desde el sistema de archivos
async function executeSQLFromFile(queryFile) {
    try {
      // Leer el archivo SQL de manera asíncrona
      const sql = await readFile(`db/${queryFile}.sql`, 'utf8');
  
      // Ejecutar la consulta SQL usando el pool de conexiones
      const [results] = await pool.query(sql);
  
      // Retornar los resultados de la consulta
      return results;
    } catch (err) {
      //console.error('Error ejecutando el archivo SQL:', err);
      throw err;  // Lanza el error para manejarlo externamente
    }
  }

  app.get('/', async (req, res) => {
    try {
      // Ejecutar la consulta y obtener los resultados
      const results = await executeSQLFromFile('test2');
      // Enviar los resultados como respuesta JSON
      res.json(results);
    } catch (err) {
      //console.error('Error en la ejecución:', err);
      res.status(500).json({ error: 'Error ejecutando la consulta SQL' });
    }
  });

app.get('/ping', async (req,res) =>{
    const [result] = await pool.query('SELECT "HOLI MUNDO" as RESULT');
    //console.log(result[0])
    res.json(result[0]); 
    //res.send('welcome to Server wa2')
})


app.get('/jhon', async (req, res) => {
    try {
      // Ejecutar la consulta y obtener los resultados
      const results = await executeSQLFromFile('test');
      // Enviar los resultados como respuesta JSON
      res.json(results);
    } catch (err) {
      //console.error('Error en la ejecución:', err);
      res.status(500).json({ error: 'Error ejecutando la consulta SQL' });
    }
  });

app.listen(PORT)

console.log('server on port',PORT)