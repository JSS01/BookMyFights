import React from 'react'
import '../stylesheets/Dashboard.css'


const TrackedFighterCard = ( {fighter} ) => {

  const typeImageSrc = fighter.type === "ufc" ? "/mma_glove.png" : "/boxing_glove.png";
  return (
    <div className='tracked-fighter-card'>
        <div className='tracked-fighter-card-type'> 
          <img src={typeImageSrc} alt={fighter.type}/>
        </div>
        <div className='tracked-fighter-card-name'> {fighter.name} </div>
        <div className='tracked-fighter-card-delete'> <button> 🗑️ </button> </div>
    </div>
  )
}

export default TrackedFighterCard
