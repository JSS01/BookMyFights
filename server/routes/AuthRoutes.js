import express from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { createUser } from "../controllers/AuthController.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
import axios from "axios";



const authRouter = express.Router();


// Checks that the user is authenticated 
authRouter.get("/me", async (req, res) => {  
  const token = req.cookies.token;
  if (!token) {    
    return res.status(401).json({ authenticated: false });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);    
    res.json({ authenticated: true, user: payload });
  } catch {
    res.status(401).json({ authenticated: false });
  }
})


// Verifies google sign in, and creates a token
authRouter.post("/google", async (req, res) => {
  const accessToken = req.body.accessToken;

  if (!accessToken) {
    return res.status(400).json({ message: "Access token missing" });
  }

  try {
    // Fetch user info using the access token
    const googleUser = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, name } = googleUser.data; 

    // Create user if needed
    const user = await createUser(email, name); 

    const userInfo = {
      userID: user.id,
      userEmail: email,
      userName: name
    }

    const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: "1h" })
  
    // Store token in HTTP only cookie 
    res.cookie('token', token, {
        httpOnly: true,   
        secure: true,    
        sameSite: 'lax', 
        maxAge: 60 * 60 * 1000, // 1hr
    });

    res.json({ message: "Successfully authenticated", user: userInfo});
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});


export default authRouter;