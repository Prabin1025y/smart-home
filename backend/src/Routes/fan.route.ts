import { Router } from "express";
import { io, states } from "..";

const fanRouter = Router();

fanRouter.get("/", (req, res) => {
    const id = req.query.id;
    const state = req.query.state;
    const turnOffDate = req.query.turnOffAt;
    const minTemp = req.query.minTemp;
    const maxTemp = req.query.maxTemp;

    if (typeof id === "string" && typeof state === "string" && (state === "on" || state === "off")) {
        const fan = states.fans.find(fn => fn.id === id);
        if (!fan)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });
        // fan.isOn = state === "on";

        if (state === "on") {
            fan.isOn = true;
            fan.turnedOnAt = new Date();
            fan.turnOffAt = turnOffDate ? new Date(Number(turnOffDate)) : null; // Set turnOffAt if provided
        } else {
            fan.isOn = false;
            fan.turnedOnAt = null;
            fan.turnOffAt = null; // Reset turnOffAt when turning off
            fan.turnOffTemperature = null;
            fan.turnOnTemperature = null;
        }

        if (minTemp && maxTemp) {
            fan.turnOffTemperature = Number(minTemp);
            fan.turnOnTemperature = Number(maxTemp);
        } else {
            fan.turnOffTemperature = null;
            fan.turnOnTemperature = null;
        }

        if (turnOffDate) {
            const targetTime = Number(turnOffDate);
            const now = Date.now();
            const delay = targetTime - now;
            if (delay > 0) {
                setTimeout(() => {
                    fan.isOn = false;
                    fan.turnedOnAt = null;
                    fan.turnOffAt = null;
                    fan.turnOffTemperature = null;
                    fan.turnOnTemperature = null;

                    io.emit("stateChanged");
                    console.log(`${fan.name} fan is turned off`);
                }, delay);
            }
        }

        console.log(`${fan.name} fan is turned ${fan.isOn ? "on" : "off"}`);
        res.status(200).json({ success: true, id, state });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
});

fanRouter.get("/speed", (req, res) => {
    const id = req.query.id;
    const speed = Number(req.query.s);

    if (typeof id === "string" && !isNaN(speed) && speed >= 0 && speed <= 255) {
        const fan = states.fans.find(fn => fn.id === id);
        if (!fan)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });


        fan.speed = speed;
        console.log(`${fan.name} fan speed set to ${fan.speed}`);
        io.emit("stateChanged");
        res.status(200).json({ success: true, id, speed: fan.speed });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
})

export default fanRouter;