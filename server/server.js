// server/server.js (FULL & COMPLETE CODE)

const http = require("http");
const path = require('path'); // <<< --- YEH LINE ADD KAREIN
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/database");
const socketHandler = require("./socket/socketHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/groups");
const uploadRoutes = require("./routes/upload");
const statusRoutes = require("./routes/status");
const callRoutes = require("./routes/calls");

const app = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:5001").split(',');
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.set('io', io);
socketHandler(io);

app.use((req, res, next) => {
    req.userSocketMap = io.userSocketMap;
    next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  }
}));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api/", apiLimiter);

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Nexus API is up and running!", status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/calls", callRoutes);

// <<< --- YEH NAYA CODE ADD KAREIN --- >>>
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
    });
}
// <<< --- NAYA CODE YAHAN KHATAM HOTA HAI --- >>>


app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "An unexpected error occurred on the server." 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server is attached and listening.`);
});