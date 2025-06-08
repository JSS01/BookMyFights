import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';



const FighterFilter = ( {sportFilter, setSportFilter}) => {
  return (
    <div>
      <FormControl fullWidth sx={{ maxWidth: 100, maxHeight: 30, mb: 2}}>
      <InputLabel id="sport-filter-label">Sport</InputLabel>
      <Select
        labelId="sport-filter-label"
        value={sportFilter}
        label="Sport"
        onChange={(e) => setSportFilter(e.target.value)}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="ufc">UFC</MenuItem>
        <MenuItem value="boxing">Boxing</MenuItem>
      </Select>
    </FormControl>
    </div>
  )
}

export default FighterFilter
