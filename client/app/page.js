'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography, CircularProgress, Box, Grid } from '@mui/material';
import './App.css'
import Navbar from './components/Navbar';

function App() {
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDate(new Date());
  }, []);

  useEffect(() => {
    if (date) {
      fetchSlots(date);
    }
  }, [date]);

  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setAvailableSlots(slots[selectedMeal] || []);
  }, [slots, selectedMeal]);

  const fetchSlots = async (selectedDate) => {
    const formattedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    try {
      const response = await axios.get(
        `http://localhost:5000/api/available-slots?date=${formattedDate}`
      );
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        date: new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0],
        time: selectedSlot,
        name,
        contact,
        guests,
      });
      alert(
        `Booking successful!\nDate: ${new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]}\nTime: ${selectedSlot}\nName: ${name}\nContact: ${contact}\nGuests: ${guests}`
      );
      setName('');
      setContact('');
      setGuests(1);
      setSelectedSlot('');
    } catch (error) {
      alert('Failed to book the slot.');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      
    }
  }, []);
  
  
  const today = new Date();
  const offset = today.getTimezoneOffset(); 
  today.setMinutes(today.getMinutes() - offset); 
  const minDate = today.toISOString().split('T')[0]; 
  // console.log(minDate);
  


  return (
    <div className="app">
    <Navbar />
      <Container maxWidth="sm">
        <form onSubmit={handleSubmit} className="form">
        <Typography variant="h4" align="center" gutterBottom marginBottom={5} fontWeight={'bold'}>
          Restaurant Table Booking
        </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
              <TextField
                label="Select Date"
                type="date"
                value={date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                inputProps={{
                  min: minDate  // Prevent past dates
                }}
              />

              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Meal Period</InputLabel>
                  <Select
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value)}
                    label="Meal Period"
                  >
                    <MenuItem value="breakfast">Breakfast</MenuItem>
                    <MenuItem value="lunch">Lunch</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" align="center" gutterBottom>
              Available Slots:
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : availableSlots.length > 0 ? (
              <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(75px, 1fr))" gap={2}>
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant="contained"
                    color={slot.booked ? 'default' : 'primary'}
                    className={`slot ${slot.time === selectedSlot ? 'selected' : ''}`}
                    disabled={slot.booked}
                    onClick={() => setSelectedSlot(slot.time)}
                  > 
                    {slot.time}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography>No slots available.</Typography>
            )}

            <Button variant="contained" color="primary" type="submit" fullWidth>
              Book Now
            </Button>
          </Box>
        </form>
      </Container>
    </div>
  );
}

export default App;
