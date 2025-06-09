import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const FighterSelector = ({ onAddFighter }) => {
  const [fighters, setFighters] = useState([]);
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch all fighters
  useEffect(() => {
    const fetchFighters = async () => {
      try {
        const res = await axios.get("http://localhost:3001/fighters", {
          withCredentials: true,
        });
        setFighters(res.data.fighters.sort((f1, f2) => f1.name > f2.name ? 1 : -1));
      } catch (err) {
        console.error("Failed to fetch fighters", err);
      }
    };
    fetchFighters();
  }, []);

  // Show confirmation modal
  const handleAdd = () => {
    if (selectedFighter) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmAdd = () => {
    onAddFighter(selectedFighter); // Call parent handler
    setSelectedFighter(null); // Reset input
    setConfirmOpen(false); // Close dialog
  };

  const handleCancelAdd = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <Box sx={{ width: 400, display: "flex", gap: 2, alignItems: "center" }}>
        <Autocomplete
          value={selectedFighter}
          onChange={(event, newValue) => setSelectedFighter(newValue)}
          options={fighters}
          getOptionLabel={(option) => `${option.name} (${option.type})`}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Select Fighter" variant="outlined" />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedFighter}
        >
          Add
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelAdd}>
        <DialogTitle>Confirm Addition</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add <strong>{selectedFighter?.name}</strong> to your tracked fighters?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdd}>Cancel</Button>
          <Button onClick={handleConfirmAdd} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FighterSelector;
