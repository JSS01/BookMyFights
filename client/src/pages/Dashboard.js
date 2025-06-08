import React, { useEffect, useState } from 'react'
import FighterSelector from '../components/FighterSelector';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import TrackedFightersTable from '../components/TrackedFightersTable';
import FighterFilter from '../components/FighterFilter';
import { Button } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { Snackbar, Alert } from '@mui/material';



const Dashboard = () => {
  
  const { user } = useUser();   
  const [userFighters, setUserFighters] = useState([]);
  const [sportFilter, setSportFilter] = useState("all");
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
      // alert(`Successfully added ${fighter.name} to your list`)
      showSnackbar(`Successfully added ${fighter.name} to your list`);
    } catch (err) {
      if (err.response?.status === 409) {
        // alert("This fighter is already in your list.");
        showSnackbar(`This fighter is already in your list.`, 'error');
      } else {
        // console.error("Error adding fighter:", err);
        showSnackbar("Failed to add fighter.", 'error');
      }
    }
  };


  const filteredFighters = sportFilter === "all" ? userFighters :
  userFighters.filter(f => f.type === sportFilter);

  return (
    <div className='dashboard-container'>
      <h1> Welcome, {user.userName} </h1>
      <div className="tracked-fighters">
        <h2> Your Fighters: </h2>
        <FighterFilter sportFilter={sportFilter} setSportFilter={setSportFilter}> </FighterFilter>
      </div>
        <TrackedFightersTable filteredFighters={filteredFighters} deleteUserFighter={deleteUserFighter}> </TrackedFightersTable>
      <div>
        <h2> Add Fighter </h2>
         <FighterSelector onAddFighter={handleAddFighter}> </FighterSelector>
      </div>  
      <Button
      style={{marginTop: 30}}
      variant="contained"
      startIcon={<SyncIcon />}
      sx={{
      backgroundColor: '#1976d2', 
      color: 'white','&:hover': {backgroundColor: '#1565c0'}}}
      >
        Sync Fights To Calendar
      </Button>

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
    </div>
  )
}
export default Dashboard
