import { createPool } from 'mysql2/promise';
import {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT 
} from './config.js'
export const pool = createPool({
  user: DB_USER,   
  password: DB_PASSWORD,  // Cambia esto por la contraseña correcta
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME  // Cambia esto por el nombre correcto de la base de datos
});
