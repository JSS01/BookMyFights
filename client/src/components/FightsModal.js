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
  import axios from 'axios';



const FightsModal = ({fights, openModal, setOpenModal, showSnackbar}) => {


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

    const handleSubmit = async () => {
        const fightsToSync = selectedFights.map((idx) => fights[idx]);
        try {
            const accessToken = localStorage.getItem("google_access_token")
            const response = await axios.post(
                "http://localhost:3001/calendar/sync-fights", 
                {accessToken: accessToken, fights: fightsToSync},
                { withCredentials: true }
            )
            console.log("Synced Events:", response.data.events);
            showSnackbar("Successfully synced selected fights to Google Calendar.");
            setOpenModal(false)

        } catch (err) {
            console.error("Error syncing fights:", err.response?.data || err.message);
            showSnackbar("Beeg errro", "error")
            setOpenModal(false)
        }

    }

    const onCloseModal = () => {
        setOpenModal(false)
        setSelectedFights([])
    }
    // Sort by date
    const sortedFights = [...fights].sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));


  return (
    <Dialog open={openModal} onClose={onCloseModal} fullWidth maxWidth="md">
        <DialogTitle> Found {sortedFights.length} Fights! </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {sortedFights.length > 0 ? (
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
                {sortedFights.map((fight, index) => (
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
        <Button onClick={onCloseModal} color="primary">
            Close
        </Button>
        </DialogActions>
    </Dialog>
  )
}

export default FightsModal