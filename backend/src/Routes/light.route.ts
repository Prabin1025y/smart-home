import { Router } from "express";
import { io, states } from "..";

const lightRouter = Router();

lightRouter.get("/", (req, res) => {
    const id = req.query.id;
    const state = req.query.state;
    const turnOffDate = req.query.turnOffAt;

    if (typeof id === "string" && typeof state === "string" && (state === "on" || state === "off")) {
        const light = states.lights.find(lgt => lgt.id === id);
        if (!light)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });

        if (state === "on") {
            light.isOn = true;
            light.turnedOnAt = new Date();
            light.turnOffAt = turnOffDate ? new Date(Number(turnOffDate)) : null; // Set turnOffAt if provided
        } else {
            light.isOn = false;
            light.turnedOnAt = null;
            light.turnOffAt = null; // Reset turnOffAt when turning off
        }

        if (turnOffDate) {
            const targetTime = Number(turnOffDate);
            const now = Date.now();
            const delay = targetTime - now;
            if (delay > 0) {
                setTimeout(() => {
                    light.isOn = false;
                    light.turnedOnAt = null;
                    light.turnOffAt = null;
                    console.log(`${light.name} light is turned off`);
                    
                    io.emit("stateChanged");
                }, delay);
            }
        }

        console.log(`${light.name} light is turned ${light.isOn ? "on" : "off"}`);
        res.status(200).json({ success: true, id, state });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
});

export default lightRouter;