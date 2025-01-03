'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert } from '@mui/material';
import Navbar from '../components/Navbar';
import { URL } from '../api';

function ShowBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all bookings from the backend
  const fetchBookings = async () => {
    // console.log(URL);
    try {
      const response = await axios.get(`${URL}/api/bookings`);
      
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching bookings. Please try again later.');
      setLoading(false);
    }
  };

  // Delete a booking
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/api/bookings/${id}`);
      alert('Booking deleted successfully!');
      // Refresh bookings list
      fetchBookings();
    } catch (error) {
      alert('Failed to delete the booking.');
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Box sx={{ width: '100%', paddingTop: 10 }}>
        <Navbar />
        <Typography variant="h3" align='center' fontWeight={'bold'} gutterBottom>
          Show Bookings
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        ) : bookings.length > 0 ? (
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell ><Typography fontSize={20} fontWeight={'bold'}>S No</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Name</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Contact</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Date</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Time</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Guests</Typography></TableCell>
                  <TableCell><Typography fontSize={20} fontWeight={'bold'}>Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking, index) => (
                  <TableRow key={booking._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.contact}</TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.guests}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(booking._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
            No bookings available.
          </Typography>
        )}
      </Box>
    </>
  );
}

export default ShowBookings;
