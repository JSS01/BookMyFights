import express from "express";
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv"
import { createUser } from "../controllers/AuthController.js";
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;



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
    const { credential } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload(); //Object with email, name, etc.
      const email = payload.email
      const name = payload.name
      
      // Create user if needed
      const user = await createUser(email, name)
      // Create a JWT for authentication in MY app 
      const userInfo = {
          userID: user.id,
          userEmail: email,
          userName: name
      }
      const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: "1h" })
  
      // Store token in HTTP only cookie 
      res.cookie('token', token, {
          httpOnly: true,   // inaccessible to JS on the client
          secure: true,    // set to true if using HTTPS in production
          sameSite: 'lax',  // controls cross-site cookie behavior
          maxAge: 60 * 60 * 1000, // 1 hour expiration
      });
  
      res.json({ message: "Successfully authenticated", user: payload});
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ success: false, error: "Invalid token" });
    }
  });

export default authRouter;