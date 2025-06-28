import React, { useState } from 'react'
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography, 
    Checkbox,
    Box
  } from '@mui/material';

  import SyncIcon from '@mui/icons-material/Sync';




const FightsModal = ({fights, openModal, setOpenModal}) => {


    const [selectedFights, setSelectedFights] = useState([])


    const selectFight = (index) => {
        setSelectedFights(prev =>
            prev.includes(index)
                ? prev.filter(id => id !== index)
                : [...prev, index]
        )
    }

    const toggleSelectAllFights = () => {
        if (selectedFights.length === fights.length) {
            setSelectedFights([])
        } else {
            setSelectedFights(fights.map((_, idx) => idx))
        }
    }

    const handleSubmit = () => {
        console.log(selectedFights.map((idx) => fights[idx]));
        
    }

  return (
    <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle> Found {fights.length} Fights! </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {fights.length > 0 ? (
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>Fighters</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell> </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {fights.map((fight, index) => (
                    <TableRow key={index}>
                    <TableCell>{fight.summary}</TableCell>
                    <TableCell>{new Date(fight.start.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{fight.location}</TableCell>
                    <TableCell> 
                    <Checkbox 
                        checked={selectedFights.includes(index)} 
                        onChange={() => selectFight(index)}> 
                    </Checkbox>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        ) : (
            <Typography>No fights found.</Typography>
        )}
        <Box display="flex" justifyContent="space-between" width="100%"> 

        <Button onClick={toggleSelectAllFights} variant="contained" color="primary" sx={{marginTop: 4}}> 
            Select All Fights
        </Button>
        <Button onClick={handleSubmit} startIcon={<SyncIcon />} disabled={selectedFights.length === 0} variant="contained" color="primary" sx={{marginTop: 4}}> 
            Sync Fights to Calendar
        </Button>
        </Box>

        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenModal(false)} color="primary">
            Close
        </Button>
        </DialogActions>
    </Dialog>
  )
}

export default FightsModal



