import React from 'react'
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
    Typography
  } from '@mui/material';

const SyncedFightsModal = ({title, syncedEvents, openModal, setOpenModal}) => {
  return (
    <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle> {title} </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {syncedEvents.length > 0 ? (
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>Fighters</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {syncedEvents.map((event, index) => (
                    <TableRow key={index}>
                    <TableCell>{event.summary}</TableCell>
                    <TableCell>{new Date(event.start.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        ) : (
            <Typography>No events found.</Typography>
        )}
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenModal(false)} color="primary">
            Close
        </Button>
        </DialogActions>
    </Dialog>
  )
}

export default SyncedFightsModal



