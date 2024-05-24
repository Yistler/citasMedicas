import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import _ from 'lodash';
import chalk from 'chalk';

const app = express();
const port = 3000;

let usuarios = [];

// Función para hacer una sola consulta a la API y procesar el resultado
const fetchRandomUser = async () => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const userData = response.data.results[0];
    return {
      id: uuidv4(),
      name: userData.name.first,
      surname: userData.name.last,
      gender: userData.gender,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Función para esperar un tiempo determinado (en ms)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Ruta para registrar 11 nuevos usuarios
app.get('/registro', async (req, res) => {
  try {
    const promises = [];

    for (let i = 0; i < 11; i++) {
      // Añadir una pequeña pausa entre las solicitudes
      await delay(100);
      promises.push(fetchRandomUser());
    }

    const newUsers = await Promise.all(promises);
    // Filtrar usuarios válidos (no null)
    const validUsers = newUsers.filter(user => user !== null);
    usuarios.push(...validUsers);

    // Formatear la respuesta
    const formattedUsers = validUsers.map(user => 
      `Nombre: ${user.name} -  Apellido: ${user.surname} -  TimeStamp: ${user.timestamp}<br/>`
    );

    res.status(201).send(formattedUsers.join(''));
  } catch (error) {
    res.status(500).send('Error registering users');
  }
});


app.get('/usuarios', (req, res) => {
  const groupedUsers = _.groupBy(usuarios, 'gender');
  // Formatear la salida según el género
  let response = '';
  let consoleOutput = '';

  if (groupedUsers.female) {
    response += 'Mujeres:<br/>';
    consoleOutput += 'Mujeres:\n';
    groupedUsers.female.forEach(user => {
      const formattedUser = `Nombre: ${user.name} -  Apellido: ${user.surname} -  ID: ${user.id.slice(0, 6)} -  TimeStamp: ${moment(user.timestamp).format('MMMM Do YYYY, h:mm:ss a')}`;
      response += `${formattedUser}<br/>`;
      consoleOutput += `${formattedUser}\n`;
    });
  }

  if (groupedUsers.male) {
    response += 'Hombres:<br/>';
    consoleOutput += 'Hombres:\n';
    groupedUsers.male.forEach(user => {
      const formattedUser = `Nombre: ${user.name} -  Apellido: ${user.surname} -  ID: ${user.id.slice(0, 6)} -  TimeStamp: ${moment(user.timestamp).format('MMMM Do YYYY, h:mm:ss a')}`;
      response += `${formattedUser}<br/>`;
      consoleOutput += `${formattedUser}\n`;
    });
  }

  console.log(chalk.bgWhite.blue(consoleOutput));

  res.status(200).send(response);
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor http://localhost:${port}`);
});

// http://localhost:3000/registro
// http://localhost:3000/usuarios
