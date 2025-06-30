import React, { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import TrackedFightersTable from '../components/TrackedFightersTable.js';
import FighterFilter from '../components/FighterFilter.js';
import FighterSelector from '../components/AddFighterSelector.js';

const FightersSection = ({userFighters, deleteUserFighter, onAddFighter }) => {
  const [open, setOpen] = useState(false);
  const [sportFilter, setSportFilter] = useState("all");

  const filteredFighters = sportFilter === "all" ? userFighters :
  userFighters.filter(f => f.type === sportFilter);

  return (
    <Box sx={{
        height: '50vh',
        border: '1px solid #ccc',      
        borderRadius: 4,               
        padding: 3,                    
        backgroundColor: 'background.paper', 
        boxShadow: 1,                  
        mb: 4                          
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" style={{ textAlign: 'center' }}>Your Fighters</Typography>
        <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setOpen(true)}>Add Fighter</Button>
      </Box>
      <FighterFilter sportFilter={sportFilter} setSportFilter={setSportFilter} />
      <TrackedFightersTable filteredFighters={filteredFighters} deleteUserFighter={deleteUserFighter}/>
      { /* Add Fighter Modal */ }
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add a Fighter</DialogTitle>
        <DialogContent>
          <div style={{marginTop: 16}}>
            <FighterSelector onAddFighter={(fighter) => { onAddFighter(fighter); setOpen(false); }} />
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FightersSection

