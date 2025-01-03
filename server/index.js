const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const corsOptions ={
  origin:'https://table-time-henna.vercel.app', 
  // origin:'http://localhost:3000', 
  credentials:true,         
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.MONGO_URL, {
}).then(()=>{
    console.log('connected to db');
}).catch((err)=>{
    console.log(err);
})
 

const bookingSchema = new mongoose.Schema({
    date: String,
    time: String,
    name: String,
    contact: String,
    guests: Number,
  });
  
  const Booking = mongoose.model('Booking', bookingSchema);
  
  const generateSlots = (selectedDate) => {
    const mealTimes = {
      breakfast: { start: 9, end: 11 },
      lunch: { start: 12, end: 17 },
      dinner: { start: 18, end: 22 },
    };
  
    const currentDateTime = new Date();
  
    // Normalize both dates to UTC for comparison
    const selectedDateUTC = new Date(selectedDate.toISOString());
    const currentDateUTC = new Date(currentDateTime.toISOString());
  
    // Check if the selected date is today
    const isToday =
      selectedDateUTC.getUTCFullYear() === currentDateUTC.getUTCFullYear() &&
      selectedDateUTC.getUTCMonth() === currentDateUTC.getUTCMonth() &&
      selectedDateUTC.getUTCDate() === currentDateUTC.getUTCDate();
  
    const slots = {};
  
    // Generate slots for each meal time
    for (const [meal, { start, end }] of Object.entries(mealTimes)) {
      slots[meal] = [];
      for (let hour = start; hour < end; hour++) {
        slots[meal].push(`${hour}:00`, `${hour}:30`);
      }
    }
  
    if (isToday) {
      const currentHour = currentDateTime.getUTCHours();
      const currentMinute = currentDateTime.getUTCMinutes();
  
      for (const meal of Object.keys(slots)) {
        slots[meal] = slots[meal].filter((slot) => {
          const [hours, minutes] = slot.split(':').map(Number);
          // Filter out slots earlier than the current time
          if (hours > currentHour) {
            return true;
          } else if (hours === currentHour && minutes > currentMinute) {
            return true;
          }
          return false;
        });
      }
    }
  
    return slots;
  };
  
  
  
  app.get('/api/available-slots', async (req, res) => {
    const { date } = req.query;
    const selectedDate = new Date(date);
    // console.log(selectedDate.getDate(), new Date().getDate());
    
    if (selectedDate.getDate() < new Date().getDate()) {
      return res.status(400).json({ error: 'Cannot select a past date.' });
    }
  
    const existingBookings = await Booking.find({ date });
    const slots = generateSlots(selectedDate);
  
    for (const meal in slots) {
      slots[meal] = slots[meal].map((slot) => {
        const isBooked = existingBookings.some((booking) => booking.time === slot);
        return { time: slot, booked: isBooked };
      });
    }
  
    res.json(slots);
  });
  
  app.post('/api/bookings', async (req, res) => {
    const { date, time, name, contact, guests } = req.body;
  
    const existingBooking = await Booking.findOne({ date, time });
    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked.' });
    }
  
    const newBooking = new Booking({ date, time, name, contact, guests });
    await newBooking.save();
    res.status(201).json(newBooking);
  });
  
  app.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
  });

  app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: 'Booking deleted' });
  });
  app.listen(5000, () => console.log('Server running on port 5000'));