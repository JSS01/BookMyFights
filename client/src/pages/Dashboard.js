import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Button } from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { Snackbar, Alert, Container, Typography, Box } from '@mui/material';

import FightsModal from '../components/FightsModal.js';
import FightersSection from '../components/FightersSection';



const Dashboard = () => {
  
  const [userFighters, setUserFighters] = useState([]);
  const [upcomingFights, setupcomingFights] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });

  useEffect(() => {
    const fetchUserFighters = async () => {
      try {
        const fighters = await axios.get("http://localhost:3001/user/fighters", {withCredentials: true});
        setUserFighters(fighters.data.fighters);
      } catch (err) {
        console.error("Error fetching fighters: ", err);
      }
    }
    fetchUserFighters();
  }, [])
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const deleteUserFighter = async (fighter) => {
      try {
        await axios.delete("http://localhost:3001/user/fighters", {
          data: { fighterId: fighter.id },
          withCredentials: true
         }
        );
        setUserFighters((prev) => prev.filter((userFighter) => userFighter.id !== fighter.id));
        showSnackbar(`Deleted ${fighter.name} from your list`)
      } catch (err) {
        console.error("Error deleting fighter: ", err);
        showSnackbar(`Error deleting ${fighter.name} from your list`, 'error')
      }
  }

  const handleAddFighter = async (fighter) => {
    try {
      await axios.post(
        "http://localhost:3001/user/fighters",
        { fighterId: fighter.id },
        { withCredentials: true }
      );
      setUserFighters((prev) => [...prev, fighter]);
      showSnackbar(`Successfully added ${fighter.name} to your list`);
    } catch (err) {
      if (err.response?.status === 409) {
        showSnackbar(`This fighter is already in your list.`, 'error');
      } else {
        showSnackbar("Failed to add fighter.", 'error');
      }
    }
  };


  const viewFights = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/calendar/upcoming-fights", 
        { withCredentials: true }
      )
      const fights = res.data.fights
      setupcomingFights(fights); 
      setOpenModal(true)
      
    } catch (err) {
      console.error(err)
    }
  }





  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" textAlign={"center"} gutterBottom> 
        Your Roster
      </Typography>

        <FightersSection 
        userFighters={userFighters}
        deleteUserFighter={deleteUserFighter}
        onAddFighter={handleAddFighter}
        >
        </FightersSection>

      {/* View Fights Button */ }
      <Box sx={{ textAlign: 'center', mb: 4, display: 'flex', justifyContent: 'center', gap: 4}}>
        <Button
          onClick={viewFights}
          variant="contained"
          startIcon={<TableRowsIcon />}
          sx={{
            backgroundColor: 'green',
            color: 'white',
            borderRadius: 3,
            height: 60,
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          View Upcoming Fights
        </Button>
      </Box>
      
     
      {/* Modals and Snackbar */}
      <FightsModal fights={upcomingFights} openModal={openModal} setOpenModal={setOpenModal} showSnackbar={showSnackbar}>
      </FightsModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
      <Alert
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
        variant="filled"
      >
      {snackbar.message}
      </Alert>
      </Snackbar>
    </Container>
  )
}
export default Dashboard

