import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';



const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
        variant="h5" component={Link} to="/"
        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
        🥊 BookMyFights
        </Typography>


        <Typography variant='h6' component={Link} to="/about"
        sx={{ textDecoration: 'none', color: 'inherit', px: 2, py: 1,
            borderRadius: 1,'&:hover': {
              backgroundColor: 'primary.dark', 
            },}}
        > About </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar