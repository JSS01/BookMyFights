import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/AuthRoutes.js";
import userFighterRouter from "./routes/UserFightersRoutes.js";
import fightersRouter from "./routes/FightersRoutes.js"

const app = express();
const PORT = 3001;


app.use(cors({
    origin: 'http://localhost:3000',  // frontend origin
    credentials: true,                // allow cookies to be sent cross-origin
  }));

app.use(cookieParser());
app.use(express.json());


// Seed fighters
// addFighters();


// Router for auth
app.use("/auth", authRouter) 

// Router for all fighters 
app.use('/fighters', fightersRouter)

// Router for user's fighters actions (adding/removing fighters)
app.use("/user/fighters", userFighterRouter)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
