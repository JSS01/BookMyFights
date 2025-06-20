import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TrackedFightersTable = ({ filteredFighters, deleteUserFighter }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState(null);

  const handleOpenDialog = (fighter) => {
    setSelectedFighter(fighter);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFighter(null);
  };

  const handleConfirmDelete = () => {
    if (selectedFighter) {
      deleteUserFighter(selectedFighter);
      handleCloseDialog();
    }
  };

  const getTypeIcon = (type) => {
    const src = type === 'ufc' ? '/mma_glove.png' : '/boxing_glove.png';
    const alt = type === 'ufc' ? 'UFC Glove' : 'Boxing Glove';
    return <img src={src} alt={alt} style={{ height: 24 }} />;
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 300, maxWidth: 700, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fighter</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFighters
              .sort((f1, f2) => f1.name.localeCompare(f2.name))
              .map((fighter, idx) => (
                <TableRow key={idx}>
                  <TableCell>{fighter.name}</TableCell>
                  <TableCell>{getTypeIcon(fighter.type)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Fighter">
                      <IconButton onClick={() => handleOpenDialog(fighter)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{selectedFighter?.name}</strong> from your tracked fighters?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrackedFightersTable;
