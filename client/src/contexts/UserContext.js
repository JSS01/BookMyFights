import { createContext, useContext } from "react";
import React, { useState } from 'react'

// To make contexts in React, we have 
// 3 steps 
// 1. Create a Context
// 2. Create a Provider component for that context ()
// 3. Use useContext() hook to access that value in child components

const UserContext = createContext();


const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    return (
        <UserContext.Provider value={{ user, setUser }}> 
            { children }
        </UserContext.Provider>
    );
}

const useUser = () => useContext(UserContext);

export { UserProvider , useUser }; 
