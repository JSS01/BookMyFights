import React from 'react'
import { Box, Typography } from '@mui/material';
import TrackedFightersTable from '../components/TrackedFightersTable.js';
import FighterFilter from '../components/FighterFilter.js';

const FightersSection = ({filteredFighters, deleteUserFighter, sportFilter, setSportFilter }) => {
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
    <Typography variant="h5" style={{marginBottom: 20, textAlign: 'center'}}>Your Fighters</Typography>
    <FighterFilter sportFilter={sportFilter} setSportFilter={setSportFilter} />
    <TrackedFightersTable filteredFighters={filteredFighters} deleteUserFighter={deleteUserFighter}/>
    </Box>
  )
}

export default FightersSection

