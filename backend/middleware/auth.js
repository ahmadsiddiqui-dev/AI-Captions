// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]; 
//   if (!token) return res.status(401).json({ message: "No token, authorization denied" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token is not valid" });
//   }
// };


// module.exports = authMiddleware;
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ REQUIRED FIX — add _id so backend can use req.user._id
    req.user = {
      ...decoded,
      _id: decoded.id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
