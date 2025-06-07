import React, { useEffect, useState } from 'react'
import FighterSelector from '../components/FighterSelector';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import TrackedFightersTable from '../components/TrackedFightersTable';

const Dashboard = () => {
  
  const { user } = useUser();   
  const [userFighters, setUserFighters] = useState([]);

  useEffect(() => {
    const fetchUserFighters = async () => {
      try {
        const fighters = await axios.get("http://localhost:3001/user/fighters", {withCredentials: true});
        console.log(fighters.data.fighters);
        setUserFighters(fighters.data.fighters);
      } catch (err) {
        console.error("Error fetching fighters: ", err);
      }
    }
    fetchUserFighters();
  }, [])

  const testDelete = async () => {
    const fighterId = 2;
      try {
        const res = await axios.delete("http://localhost:3001/user/fighters", {
          data: { fighterId },
          withCredentials: true
         }
        );
        console.log("delete res: ", res);
      } catch (err) {
        console.error("Error deleting fighter: ", err);
      }
  }

  const getAllFighters = async () => {
    try {
      const res = await axios.get("http://localhost:3001/fighters", {withCredentials: true});
      const allFighters = res.data.fighters;
      console.log((allFighters));
    } catch (err) {
      console.error("Error getting all fighters: ", err)
    }
    
  }


  return (
    <div className='dashboard-container'>
      <h1> Welcome, {user.userName} </h1>
      <h2> Tracked Fighters: </h2>
      <TrackedFightersTable fighters={userFighters}> </TrackedFightersTable>
      <div>
        <h2> Add Fighter </h2>
         <FighterSelector> </FighterSelector>
      </div>  

      <button onClick={testDelete}> Delete Fighter Test </button>
      <button onClick={getAllFighters}> Sync Fights </button>
    </div>
  )
}
export default Dashboard
