import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

import fanRouter from './Routes/fan.route';
import lightRouter from './Routes/light.route';
import securityRouter from './Routes/security.route';

export type StatesType = {
  lights: {
    id: string;
    name: string;
    location: string;
    isOn: boolean;
    onOffDate: {
      on: Date | null; // Optional field for the date when the fan was turned on
      off: Date | null; // Optional field for the date when the fan was turned off
    };
    brightness: number; // Optional field for brightness, if applicable
  }[];
  fans: {
    id: string;
    name: string;
    location: string;
    isOn: boolean;
    speed: number;
    onOffDate: {
      on: Date | null; // Optional field for the date when the fan was turned on
      off: Date | null; // Optional field for the date when the fan was turned off
    };
    onOffTemperature: {
      on: number | null; // Optional field for the temperature at which the fan turns on
      off: number | null; // Optional field for the temperature at which the fan turns off
    }
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
    { id: "livingRoom", name: "Living Room", location: "Main Floor", isOn: false, onOffDate: { on: null, off: null }, brightness: 255 },
    { id: "kitchen", name: "Kitchen", location: "Main Floor", isOn: false, onOffDate: { on: null, off: null }, brightness: 255 },
    { id: "bedroom", name: "Master Bedroom", location: "Second Floor", isOn: false, onOffDate: { on: null, off: null }, brightness: 255 },
    // { id: "office", name: "Office", location: "Second Floor", isOn: false, onOffDate:{on: null, off: null}, brightness: 255 },
    // { id: "bathroom", name: "Bathroom", location: "Main Floor", isOn: false, onOffDate:{on: null, off: null}, brightness: 255 },
    // { id: "outside", name: "Outside", location: "Ground Floor", isOn: false, onOffDate:{on: null, off: null}, brightness: 255 },
  ],
  fans: [
    { id: "livingRoom", name: "Living Room Fan", location: "Main Floor", isOn: false, speed: 255, onOffDate: { on: null, off: null }, onOffTemperature: { on: null, off: null } },
    { id: "bedroom", name: "Bedroom Fan", location: "Second Floor", isOn: false, speed: 255, onOffDate: { on: null, off: null }, onOffTemperature: { on: null, off: null } },
    // { id: "kitchen", name: "Kitchen Fan", location: "Main Floor", isOn: false, speed: 255, onOffDate:{on: null, off: null}, onOffTemperature:{on: null, off: null} },
    // { id: "office", name: "Office Fan", location: "Second Floor", isOn: false, speed: 255, onOffDate:{on: null, off: null}, onOffTemperature:{on: null, off: null} },
  ],
  security: [
    { id: "mainGate", name: "Main Gate", type: "gate", isOn: false },
  ]
}

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});
const PORT = process.env.PORT || 3000;

const allowedOrigins = [ 'http://127.0.0.1:3001', 'http://localhost:5173' ];

app.use(cors({
  origin: function (origin, callback) {
    // console.log(origin);
    if (!origin || allowedOrigins.includes(origin || "")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you're using cookies/auth
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
  states.lights.forEach(light => {
    light.isOn = false;
    light.onOffDate = { on: null, off: null }; // Reset onOffDate

  });
  states.fans.forEach(fan => {
    fan.isOn = false;
    fan.onOffDate = { on: null, off: null }; // Reset onOffDate
    fan.onOffTemperature = { on: null, off: null }; // Reset temperatures

  });
  states.security.forEach(sec => sec.isOn = false);
  res.status(200).json({ success: true, message: "All devices turned off", states });
});

app.get("/api/temperature", (req, res) => {
  if (!Number(req.query.temp))
    return;

  const temp = Number(req.query.temp);
  const humidity = Number(req.query.humidity);

  states.fans.forEach(fan => {
    if (fan.isOn && fan.onOffTemperature.off && temp <= fan.onOffTemperature.off) {
      fan.isOn = false;
      io.emit("stateChanged");
    } else if (!fan.isOn && fan.onOffTemperature.on && temp > fan.onOffTemperature.on) {
      fan.isOn = true;

      // Check if the fan has a turnOffDate set
      if (fan.onOffDate.off) {
        const targetTime = Number(fan.onOffDate.off);
        const now = Date.now();
        const delay = targetTime - now; //get the delay in milliseconds

        if (delay > 0) {
          setTimeout(() => {
            if (!fan.isOn)
              return;

            fan.isOn = false;
            fan.onOffDate = { on: null, off: null }; // Reset onOffDate
            fan.onOffTemperature = { on: null, off: null }; // Reset temperatures

            io.emit("stateChanged");
            console.log(`${fan.name} fan is turned off`);
          }, delay);
        }
      }
    }
  });
  res.status(200).json({ success: true, temperature: temp, humidity });
});

// app.get("/api/temp", (req, res) => {
//   if (!req.query.temp)
//     return;

//   const temp = Number(req.query.temp) || Math.floor(Math.random() * 30) + 15; // Default to a random temperature if not provided
//   const humidity = Number(req.query.humidity) || Math.floor(Math.random() * 30) + 15;

//   states.fans.forEach(fan => {
//     if (fan.isOn && fan.turnOffTemperature && temp < fan.turnOffTemperature) {
//       fan.isOn = false;
//       fan.turnedOnAt = null;
//       fan.turnOffAt = null;
//       // fan.turnOffTemperature = null;
//       // fan.turnOnTemperature = null;
//       io.emit("stateChanged");
//     } else if (!fan.isOn && fan.turnOnTemperature && temp > fan.turnOnTemperature) {
//       fan.isOn = true;
//       fan.turnedOnAt = new Date();
//       fan.turnOffAt = null;
//       // fan.turnOffTemperature = null;
//       // fan.turnOnTemperature = null;
//       io.emit("stateChanged");
//     }
//   });
//   io.emit("temperatureUpdate", { temperature: temp, humidity });
//   res.status(200).json({ success: true, temperature: temp, humidity });
// });

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

io.on("connection", socket => {
  console.log("A new connection has been established with ID:", socket.id);
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
