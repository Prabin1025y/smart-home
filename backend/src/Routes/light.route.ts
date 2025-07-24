import { Router } from "express";
import { io, states } from "..";

type ReqBodyType = {
    id: string;
    state: "on" | "off";
    turnOffDate?: string; // ISO date string
}

const lightRouter = Router();

lightRouter.post("/", (req, res) => {
    const { id, state, turnOffDate }: ReqBodyType = req.body;

    const light = states.lights.find(lt => lt.id === id);
    if (!light)
        return res.status(404).json({ success: false, message: "Specified light doesn't exists." });

    if (state === "on") {
        //turn on the light
        light.isOn = true;
        light.onOffDate.on = new Date(); // Set the date when the light was turned on
        light.onOffDate.off = null; // Reset the off date
        if (turnOffDate) {
            light.onOffDate.off = new Date(Number(turnOffDate)); // Set turnOffAt if provided

            const targetTime = Number(turnOffDate);
            const now = Date.now();
            const delay = targetTime - now; //get the delay in milliseconds

            if (delay > 0) {
                setTimeout(() => {
                    light.isOn = false;
                    light.onOffDate = { on: null, off: null }; // Reset onOffDate

                    io.emit("stateChanged");
                    console.log(`${light.name} light is turned off`);
                }, delay);
            }
        }
    } else {
        light.isOn = false;
        light.onOffDate = { on: null, off: null }; // Reset onOffDate
    }


    console.log(`${light.name} light is turned ${light.isOn ? "on" : "off"}`);
    res.status(200).json({ success: true, id, state });
});

lightRouter.post("/intensity", (req, res) => {
    const { id, intensity: brightness }: { id: string, intensity: number } = req.body;

    if (brightness < 0 || brightness > 255) {
        return res.status(400).json({ success: false, message: "Invalid brightness value. Brightness must be between 0 and 255." });
    }

    const light = states.lights.find(lt => lt.id === id);

    if (!light)
        return res.status(404).json({ success: false, message: "Specified light doesn't exists." });

    light.brightness = brightness;
    console.log(`${light.name} light brightness set to ${light.brightness}`);
    io.emit("stateChanged");
    res.status(200).json({ success: true, id, brightness: light.brightness });
})

export default lightRouter;