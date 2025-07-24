import { Router } from "express";
import { io, states } from "..";

const fanRouter = Router();

type ReqBodyType = {
    id: string;
    state: "on" | "off";
    turnOffDate?: string; // ISO date string
    minTemp?: number;
    maxTemp?: number;
}

fanRouter.post("/", (req, res) => {
    const { id, state, turnOffDate, minTemp, maxTemp }: ReqBodyType = req.body;

    const fan = states.fans.find(fn => fn.id === id);
    if (!fan)
        return res.status(404).json({ success: false, message: "Specified fan doesn't exists." });

    if (state === "on") {
        //turn on the fan
        fan.isOn = true;
        fan.onOffDate.on = new Date(); // Set the date when the fan was turned on
        fan.onOffDate.off = null; // Reset the off date
        if (turnOffDate) {
            fan.onOffDate.off = new Date(Number(turnOffDate)); // Set turnOffAt if provided

            const targetTime = Number(turnOffDate);
            const now = Date.now();
            const delay = targetTime - now; //get the delay in milliseconds

            if (delay > 0) {
                setTimeout(() => {
                    fan.isOn = false;
                    fan.onOffDate = { on: null, off: null }; // Reset onOffDate
                    fan.onOffTemperature = { on: null, off: null }; // Reset temperatures

                    io.emit("stateChanged");
                    console.log(`${fan.name} fan is turned off`);
                }, delay);
            }
        }
    } else {
        fan.isOn = false;
        fan.onOffDate = { on: null, off: null }; // Reset onOffDate
        fan.onOffTemperature = { on: null, off: null }; // Reset temperatures
    }

    if (minTemp && maxTemp) {
        fan.onOffTemperature = { on: maxTemp, off: minTemp };
    } else {
        fan.onOffTemperature = { on: null, off: null };
    }


    console.log(`${fan.name} fan is turned ${fan.isOn ? "on" : "off"}`);
    res.status(200).json({ success: true, id, state });
});

fanRouter.post("/intensity", (req, res) => {
    const { id, intensity: speed }: { id: string, intensity: number } = req.body;

    if (speed < 0 || speed > 255) {
        return res.status(400).json({ success: false, message: "Invalid speed value. Speed must be between 0 and 255." });
    }

    const fan = states.fans.find(fn => fn.id === id);

    if (!fan)
        return res.status(404).json({ success: false, message: "Specified fan doesn't exists." });

    fan.speed = speed;
    console.log(`${fan.name} fan speed set to ${fan.speed}`);
    io.emit("stateChanged");
    res.status(200).json({ success: true, id, speed: fan.speed });
})

export default fanRouter;