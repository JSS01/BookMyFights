import React, { useEffect, useState } from 'react'
import FighterSelector from '../components/FighterSelector';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import TrackedFightersTable from '../components/TrackedFightersTable';
import FighterFilter from '../components/FighterFilter';
import { Button } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { Snackbar, Alert, Container, Typography, Box } from '@mui/material';
import SyncedFightsModal from '../components/SyncedFightsModal';


const Dashboard = () => {
  
  const { user } = useUser();   
  const [userFighters, setUserFighters] = useState([]);
  const [sportFilter, setSportFilter] = useState("all");
  const [syncedEvents, setSyncedEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Upcoming Fights");

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
        showSnackbar(`Error deleting ${fighter.name} from your list`)
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

  const syncFights = async () => {
    try {
      const accessToken = localStorage.getItem("google_access_token")
      const res = await axios.post(
        "http://localhost:3001/calendar/sync-fights", 
        {accessToken: accessToken},
        { withCredentials: true }
      )
      const numEventsAdded = res.data.events.length;
      setSyncedEvents(res.data.events); 
      setModalTitle("Synced Fights"); 
      setOpenModal(true)

      if (numEventsAdded === 0) {
        showSnackbar("No upcoming fights for your fighters found")
      } else {
      showSnackbar(`Successfully added ${numEventsAdded} fights to your calendar`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const viewFights = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/calendar/upcoming-fights", 
        { withCredentials: true }
      )
      const fights = res.data.fights
      setSyncedEvents(fights); 
      setModalTitle("Upcoming Fights"); 
      setOpenModal(true)

      
    } catch (err) {
      console.error(err)
    }
  }


  const filteredFighters = sportFilter === "all" ? userFighters :
  userFighters.filter(f => f.type === sportFilter);



  

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom> 
        Welcome, {user.userName}
      </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" style={{marginBottom: 20}}>Your Fighters</Typography>
          <FighterFilter sportFilter={sportFilter} setSportFilter={setSportFilter} />
          <TrackedFightersTable
            filteredFighters={filteredFighters}
            deleteUserFighter={deleteUserFighter}
          />
        </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Fighter
        </Typography>
        <FighterSelector onAddFighter={handleAddFighter} />
      </Box>
      

      <Box sx={{ textAlign: 'center', mb: 4}}>

        <Button
          onClick={viewFights}
          variant="contained"
          startIcon={<TableRowsIcon />}
          sx={{
            backgroundColor: 'green',
            color: 'white',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          View Upcoming Fights
        </Button>

        <Button
          onClick={syncFights}
          variant="contained"
          startIcon={<SyncIcon />}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Sync Fights To Calendar
        </Button>

      </Box>
      

      <SyncedFightsModal   title={modalTitle} syncedEvents={syncedEvents} openModal={openModal} setOpenModal={setOpenModal}>
      </SyncedFightsModal>

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
