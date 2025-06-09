import React from 'react'
import TrackedFighterCard from './TrackedFighterCard'
import "../stylesheets/Dashboard.css"


const TrackedFightersTable = ( {filteredFighters, deleteUserFighter} ) => {
  return (
    <>
      <div className='tracked-fighters-list'>
        {filteredFighters.sort((f1, f2) => f1.name > f2.name ? 1 : -1).map((fighter, idx) => 
        <TrackedFighterCard key={idx} fighter={fighter} deleteUserFighter={deleteUserFighter}> </TrackedFighterCard>)}
      </div>
    </>
  )
}

export default TrackedFightersTable
