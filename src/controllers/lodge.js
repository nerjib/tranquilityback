const express = require('express');
const moment = require ('moment')
const router = express.Router();
// const db = require('../db/index');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('./cloudinary')

const dataFilePath = path.join(__dirname, 'rooms.json'); // Path to the JSON file
const bookingsFilePath = path.join(__dirname, 'bookings.json');
const heroContentFilePath = path.join(__dirname, 'heroContent.json');

const readHeroContent = () => {
    try {
        const data = fs.readFileSync(heroContentFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading hero content:", error);
        return []; // Return empty array if file doesn't exist or there's an error
    }
};

const writeHeroContent = (content) => {
  try {
      fs.writeFileSync(heroContentFilePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (error) {
      console.error("Error writing hero content:", error);
  }
};

let heroContent = readHeroContent();

const readBookingsData = () => {
    try {
        const data = fs.readFileSync(bookingsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading bookings data:", error);
        return [];
    }
};

const writeBookingsData = (bookings) => {
    try {
        fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing bookings data:", error);
    }
};

let bookings = readBookingsData();

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

router.get('/hero', (req, res) => {
  res.json(heroContent);
});

router.put('/hero', upload.array('images', 10), async(req, res) => {
  try {
      let updatedContent = JSON.parse(req.body.content);
      const uploader = async (path) => await cloudinary.uploads(path, 'lodge/room', req.body.name+'_'+(new Date()).getTime());
      // const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      const urls = []
      try{
      if (req.files && req.files.length > 0) {
    
            const files = req.files;
            for (const file of files) {
              const { path } = file;
              const newPath = await uploader(path)
              urls.push(newPath.url)
            fs.unlinkSync(path)
            }
          // const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
          updatedContent = updatedContent.map((item, index) => {
              if (item.isBeingUpdated) {
                  return { ...item }; // Update image if a new one was uploaded
              }
              return item
          })
      }
      heroContent = updatedContent;
      writeHeroContent(heroContent);
      res.json({ message: 'Hero content updated', content: heroContent });
    }catch(error){

    }
  } catch (error) {
      console.error("Error updating hero content:", error);
      res.status(500).json({ message: "Error updating hero content" });
  }
});

router.get('/home', (req, res) => {
    res.json(homeContent);
});

router.put('/home', upload.single('image'), async (req, res) => {
    let updatedContent = JSON.parse(req.body.content); // Parse the content string
    const uploader = async (path) => await cloudinary.uploads(path, 'lodge/home', req.body.name+'_'+(new Date()).getTime());
    if (req.file) {
      const urls = []
        const file = req.file.path;
          const newPath = await uploader(file)
          urls.push(newPath.url)
        updatedContent = {
            ...updatedContent,
            experiences: updatedContent.experiences.map(exp => {
                if (exp.isBeingUpdated) {
                    return { ...exp, image: urls[0] };
                }
                return exp;
            })
        };
    }
    homeContent = updatedContent;
    writeHomeContent(homeContent);
    res.json({ message: 'Home content updated', content: homeContent });
});

router.get('/uploads', express.static(path.join(__dirname, './uploads')))

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
  router.post('/uploads', upload.single('image'),  async(req, res) => {
    // let updatedContent = JSON.parse(req.body.content); // Parse the content string
    const uploader = async (path) => await cloudinary.uploads(path, 'lodge/home', req.body.name+'_'+(new Date()).getTime());
    
    try{
      const urls = []
      if (req.file) {
        const file = req.file.path;
          const newPath = await uploader(file)
          urls.push(newPath.url)
    }
        res.status(201).json({ message: 'successful', imgUrl: urls[0] });
      } catch (error) {
      return res.status(400).send(error);
      }    
      });

  router.post('/rooms', upload.array('images', 10),  async(req, res) => {

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
if (!req.files || req.files.length === 0) {
  return res.status(400).json({ message: 'No images uploaded' });
}
const uploader = async (path) => await cloudinary.uploads(path, 'lodge/room', req.body.name+'_'+(new Date()).getTime());
// const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
const urls = []
try{
const files = req.files;
for (const file of files) {
  const { path } = file;
  const newPath = await uploader(path)
  urls.push(newPath.url)
 fs.unlinkSync(path)
 }
const newRoom = {
  ...req.body,
  images: urls, // Store an array of image paths
  price: parseInt(req.body.price)
};
  
    rooms.push(newRoom);
    writeRoomData(rooms);
    res.status(201).json({ message: 'Room created', room: newRoom, urls });
  } catch (error) {
  return res.status(400).send(error);
  }

  });

  router.put('/rooms/:name',  upload.array('images', 10), async(req, res) => {
    const roomName = req.params.name;
    const roomIndex = rooms.findIndex(r => r.name === roomName);
  
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }
  
    let updatedRoom = {
      ...rooms[roomIndex],
      ...JSON.parse(req.body.room),
      price: parseInt(JSON.parse(req.body.room).price)
  };
  const uploader = async (path) => await cloudinary.uploads(path, 'lodge/room', req.body.name+'_'+(new Date()).getTime());
// const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
const urls = []
try{

  
      if (req.files && req.files.length > 0) {
        // const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
        const files = req.files;
        for (const file of files) {
          const { path } = file;
          const newPath = await uploader(path)
          urls.push(newPath.url)
        fs.unlinkSync(path)
        }
        updatedRoom.images = [...updatedRoom.images, ...urls]; // Add new images
    }

    rooms[roomIndex] = updatedRoom;
    writeRoomData(rooms);
    res.json({ message: 'Room updated', room: updatedRoom });
   } catch(error) {

   }
  
})
// Add a new route to update room availability
router.put('/rooms/:name/availability', (req, res) => {
  const roomName = req.params.name;
  const { available } = req.body; // Get the new availability status

  const roomIndex = rooms.findIndex(r => r.name === roomName);

  if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
  }

  rooms[roomIndex].available = available; // Update availability
  writeRoomData(rooms);
  res.json({ message: 'Room availability updated', room: rooms[roomIndex] });
});
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
router.delete('/rooms/:name/images/:image', (req, res) => {
  const roomName = req.params.name
  const imagePath = req.params.image
  const imageIndex = req.params.index
  const roomIndex = rooms.findIndex(r => r.name === roomName)

  if (roomIndex === -1) return res.status(404).json({message: 'Room not found'})

  rooms[roomIndex].images = rooms[roomIndex].images.filter(image => image?.split('/room/')[1] !== imagePath);
  writeRoomData(rooms)
  res.status(204).send()
})
router.get('/bookings', (req, res) => {
  res.json(bookings)
})

router.get('/rooms/:checkIn/:checkOut', (req, res) => {
  const checkIn = req.params.checkIn
  const checkOut = req.params.checkOut
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (checkInDate >= checkOutDate){
      return res.status(400).json({message: 'Check out date must be after check in date'})
  }

  const availableRooms = rooms.map(room => {
      const isBooked = bookings.some(booking => {
          if (!booking.roomTypes.includes(room.name)) return false
          const bookingCheckIn = new Date(booking.checkIn)
          const bookingCheckOut = new Date(booking.checkOut)
          return (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn)
      })

      return {...room, available: !isBooked}
  })

  res.json(availableRooms)
})

router.post('/bookings', (req, res) => {
  const { roomTypes, checkIn, checkOut, guests, ...rest } = req.body;
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (!Array.isArray(roomTypes) || roomTypes.length === 0) {
      return res.status(400).json({ message: 'At least one room type must be selected' });
  }

  if (checkInDate >= checkOutDate){
      return res.status(400).json({message: 'Check out date must be after check in date'})
  }

  // Check availability for all requested rooms and dates
  const unavailableRooms = roomTypes.filter(roomType => {
      return bookings.some(booking => {
          if (!booking.roomTypes.includes(roomType)) return false
          const bookingCheckIn = new Date(booking.checkIn)
          const bookingCheckOut = new Date(booking.checkOut)
          return (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn)
      })
  });

  if (unavailableRooms.length > 0) {
      return res.status(400).json({ message: `The following rooms are not available for the selected dates: ${unavailableRooms.join(', ')}` });
  }

  const booking = {
      id: Date.now(),
      roomTypes,
      checkIn,
      checkOut,
      guests,
      ...rest
  };

  bookings.push(booking);
  writeBookingsData(bookings); // Save the bookings data

  console.log('New booking:', booking);
  res.status(201).json({ message: 'Booking successful', bookingId: booking.id });
});

// route to reset the rooms when the user reload the page
router.get('/reset', (req, res) => {
  bookings = []
  writeBookingsData(bookings)
  res.json({message: 'bookings reset'})
})
router.delete('/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id)
  bookings = bookings.filter(booking => booking.id !== id)
  writeBookingsData(bookings)
  res.status(204).send()
})
  module.exports = router;