import jwt from "jsonwebtoken"
const protect = (req, res, next) => {
    try {
      // Get token from cookie
      const token = req.cookies.token   

      if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }
  
      // Verify token 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach user info to request for use in routes
      req.user = decoded;
  
      next(); // allow access
    } catch (err) {
      console.log("Error in middleware was: ", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };

export default protect
  