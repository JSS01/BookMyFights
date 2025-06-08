import React from 'react'
import TrackedFighterCard from './TrackedFighterCard'
import "../stylesheets/Dashboard.css"


const TrackedFightersTable = ( {filteredFighters, deleteUserFighter} ) => {
  return (
    <>
      <div className='tracked-fighters-list'>
        {filteredFighters.map((fighter, idx) => 
        <TrackedFighterCard key={idx} fighter={fighter} deleteUserFighter={deleteUserFighter}> </TrackedFighterCard>)}
      </div>
    </>
  )
}

export default TrackedFightersTable
