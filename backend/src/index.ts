import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

import fanRouter from './Routes/fan.route';
import lightRouter from './Routes/light.route';
import securityRouter from './Routes/security.route';

// type StateType = {
//   fan: {
//     [key: string]: boolean;
//   };
//   light: {
//     [key: string]: boolean;
//   };
//   security: {
//     gate: "open" | "closed";
//   };
// };

// export let states: StateType = {
//   fan: {
//     livingRoom: false,
//     bedroom: false,
//     kitchen: false,
//     office: false
//   },
//   light: {
//     livingRoom: false,
//     bedroom: false,
//     kitchen: false,
//     office: false,
//     bathroom: false,
//     outside: false
//   },
//   security: {
//     gate: "closed"
//   }
// }

type StatesType = {
  lights: {
    id: string;
    name: string;
    location: string;
    isOn: boolean;
  }[];
  fans: {
    id: string;
    name: string;
    location: string;
    isOn: boolean;
    speed: string;
  }[];
  security: {
    id: string;
    name: string;
    type: string;
    isOn: boolean;
  }[];
}

export let states: StatesType = {
  lights: [
    { id: "livingRoom", name: "Living Room", location: "Main Floor", isOn: false },
    { id: "kitchen", name: "Kitchen", location: "Main Floor", isOn: false },
    { id: "bedroom", name: "Master Bedroom", location: "Second Floor", isOn: false },
    { id: "office", name: "Office", location: "Second Floor", isOn: false },
    { id: "bathroom", name: "Bathroom", location: "Main Floor", isOn: false },
    { id: "outside", name: "Outside", location: "Ground Floor", isOn: false },
  ],
  fans: [
    { id: "livingRoom", name: "Living Room Fan", location: "Main Floor", isOn: false, speed: "Medium" },
    { id: "bedroom", name: "Bedroom Fan", location: "Second Floor", isOn: false, speed: "Off" },
    { id: "kitchen", name: "Kitchen Fan", location: "Main Floor", isOn: false, speed: "High" },
    { id: "office", name: "Office Fan", location: "Second Floor", isOn: false, speed: "Off" },
  ],
  security: [
    { id: "mainGate", name: "Main Gate", type: "gate", isOn: false },
  ],
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173", // Adjust this to your frontend URL
  methods: ["GET"],
}))
app.use(express.json());
app.use('/api/fans', fanRouter);
app.use('/api/lights', lightRouter);
app.use('/api/security', securityRouter);


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api/status", (req, res) => {
  console.log("Status requested");
  res.status(200).json({ success: true, states });
})

app.get("/api/invalid", (req, res) => {
  res.status(400).json({ success: false, message: "Invalid API endpoint" });
});

app.get("/api/turn-off", (req, res) => {
  console.log("Turning off all devices");
  states.lights.forEach(light => light.isOn = false);
  states.fans.forEach(fan => fan.isOn = false);
  states.security.forEach(sec => sec.isOn = false);
  res.status(200).json({ success: true, message: "All devices turned off", states });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

io.on("connection", socket => {
  console.log("A new connection has been established with ID:", socket.id);
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
