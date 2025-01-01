const express = require('express');
const moment = require ('moment')
const router = express.Router();
const db = require('../db/index');
const path = require('path');


const dataFilePath = path.join(__dirname, 'rooms.json'); // Path to the JSON file

// Function to read room data from the JSON file
const readRoomData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading room data:", error);
    return []; // Return empty array if file doesn't exist or there's an error
  }
};

// Function to write room data to the JSON file
const writeRoomData = (rooms) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(rooms, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing room data:", error);
  }
};

let rooms = readRoomData(); // Initialize rooms from the JSON file

  
router.get('/rooms', async (req, res) => {
    // const getAllQ = `SELECT * FROM sites`;
    // try {
    //   // const { rows } = qr.query(getAllQ);
    //   const { rows } = await db.query(getAllQ);
    //   return res.status(201).send(rows);
    // } catch (error) {
    //   if (error.routine === '_bt_check_unique') {
    //     return res.status(400).send({ message: 'User with that EMAIL already exist' });
    //   }
    //   return res.status(400).send(`${error} jsh`);
    // }
    return res.status(200).send(rooms);
  });  

  router.post('/rooms',   async(req, res) => {

//     if (req.method === 'POST') {
    
//     const createUser = `INSERT INTO layouts
//         (customerid,date, proposedlayout,plotno, formid)
//       VALUES ($1, $2, $3, $4, $5) RETURNING *`;
//     console.log(req.body)
//     const values = [
//     req.body.customerid,
//     moment(new Date()),
//     req.body.layout,
//     req.body.plot,
//     req.body.formid
//       ];
//     try {
//     const { rows } = await db.query(createUser, values);
//     // console.log(rows);
//     return res.status(201).send(rows);
//     } catch (error) {
//     return res.status(400).send(error);
//     }  
//   //  },{ resource_type: "auto", public_id: `ridafycovers/${req.body.title}` })
// } else {
//     res.status(405).json({
//       err: `${req.method} method not allowed`
//     })
//   }
const newRoom = req.body;
  rooms.push(newRoom);
  writeRoomData(rooms);
  res.status(201).json({ message: 'Room created', room: newRoom });

  });

  router.put('/rooms/:name', (req, res) => {
    const roomName = req.params.name
    const updatedRoom = req.body

    const roomIndex = rooms.findIndex(r => r.name === roomName)

    if (roomIndex === -1){
        return res.status(404).json({message: 'Room not found'})
    }

    rooms[roomIndex] = updatedRoom
    writeRoomData(rooms)
    res.json({message: 'Room updated', room: updatedRoom})
})

router.delete('/rooms/:name', (req, res) => {
    const roomName = req.params.name
    const roomIndex = rooms.findIndex(r => r.name === roomName)

    if (roomIndex === -1){
        return res.status(404).json({message: 'Room not found'})
    }

    rooms.splice(roomIndex, 1)
    writeRoomData(rooms)
    res.status(204).send()
})



  module.exports = router;
