// import React from 'react'
// import '../stylesheets/Dashboard.css'
// import DeleteIcon from '@mui/icons-material/Delete';


// const TrackedFighterCard = ( {fighter, deleteUserFighter} ) => {

//   const typeImageSrc = fighter.type === "ufc" ? "/mma_glove.png" : "/boxing_glove.png";
//   return (
//     <div className='tracked-fighter-card'>
//         <div className='tracked-fighter-card-type'> 
//           <img src={typeImageSrc} alt={fighter.type}/>
//         </div>
//         <div className='tracked-fighter-card-name'> {fighter.name} </div>
//         <DeleteIcon 
//         onClick={() => deleteUserFighter(fighter.id)} 
//         style={{ cursor: 'pointer', color: 'gray', margin: 10 }} 
//       />
//     </div>
//   )
// }

// export default TrackedFighterCard


import React, { useState } from 'react';
import '../stylesheets/Dashboard.css';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const TrackedFighterCard = ({ fighter, deleteUserFighter }) => {
  const [open, setOpen] = useState(false);

  const typeImageSrc =
    fighter.type === 'ufc' ? '/mma_glove.png' : '/boxing_glove.png';

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirmDelete = () => {
    deleteUserFighter(fighter);
    handleClose();
  };

  return (
    <>
      <div className="tracked-fighter-card">
        <div className="tracked-fighter-card-type">
          <img src={typeImageSrc} alt={fighter.type} />
        </div>
        <div className="tracked-fighter-card-name">{fighter.name}</div>
        <DeleteIcon
          onClick={handleClickOpen}
          style={{ cursor: 'pointer', color: 'gray', margin: 10 }}
        />
      </div>

      {/* Confirm Deletion Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{fighter.name}</strong> from
            your tracked fighters?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrackedFighterCard;

