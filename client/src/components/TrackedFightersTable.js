import React from 'react'

import TrackedFighterCard from './TrackedFighterCard'
import "../stylesheets/Dashboard.css"

//TODO: Add sorting by sport 

const TrackedFightersTable = ( {fighters} ) => {
  return (
    <div className='tracked-fighters-list'>
      {fighters.map((fighter, idx) => 
      <TrackedFighterCard key={idx} fighter={fighter}> </TrackedFighterCard>)}
    </div>
  )
}

export default TrackedFightersTable
