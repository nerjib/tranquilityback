const express = require('express');
const moment = require ('moment')
const router = express.Router();
const db = require('../db/index');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const dataFilePath = path.join(__dirname, 'rooms.json'); // Path to the JSON file

// Function to read room data from the JSON file
const readRoomData = () => {
    try {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  };
  
  const writeRoomData = (rooms) => {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(rooms, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing room data:", error);
    }
  };

  let rooms = readRoomData();
const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
const homeContentFilePath = path.join(__dirname, 'homeContent.json');

const readHomeContent = () => {
    try {
        const data = fs.readFileSync(homeContentFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading home content:", error);
        return {
            welcome: { title: "Welcome to Tranquility Lodge", content: []},
            experiences: [],
            testimonials: []
        };
    }
};

const writeHomeContent = (content) => {
    try {
        fs.writeFileSync(homeContentFilePath, JSON.stringify(content, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing home content:", error);
    }
};

let homeContent = readHomeContent();

router.get('/home', (req, res) => {
    res.json(homeContent);
});

router.put('/home', upload.single('image'), (req, res) => {
    let updatedContent = JSON.parse(req.body.content); // Parse the content string
    if (req.file) {
        updatedContent = {
            ...updatedContent,
            experiences: updatedContent.experiences.map(exp => {
                if (exp.isBeingUpdated) {
                    return { ...exp, image: `/uploads/${req.file.filename}` };
                }
                return exp;
            })
        };
    }
    homeContent = updatedContent;
    writeHomeContent(homeContent);
    res.json({ message: 'Home content updated', content: homeContent });
});

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

  router.post('/rooms', upload.single('image'),  async(req, res) => {

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
if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const newRoom = {
    ...req.body,
    image: `/uploads/${req.file.filename}`, // Store the path
    price: parseInt(req.body.price)
  };

  rooms.push(newRoom);
  writeRoomData(rooms);
  res.status(201).json({ message: 'Room created', room: newRoom });

  });

  router.put('/rooms/:name',  upload.single('image'), (req, res) => {
    const roomName = req.params.name;
    const roomIndex = rooms.findIndex(r => r.name === roomName);
  
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }
  
    const updatedRoom = {
      ...rooms[roomIndex], // Keep existing properties
      ...req.body,
      price: parseInt(req.body.price)
    };
  
    if (req.file) {
      updatedRoom.image = `/uploads/${req.file.filename}`;
    }
  
    rooms[roomIndex] = updatedRoom;
    writeRoomData(rooms);
    res.json({ message: 'Room updated', room: updatedRoom });
  
})

router.delete('/rooms/:name', (req, res) => {
    const roomName = req.params.name;
    const roomIndex = rooms.findIndex(r => r.name === roomName);
  
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }
  
    rooms.splice(roomIndex, 1);
    writeRoomData(rooms);
    res.status(204).send();
})



  module.exports = router;
