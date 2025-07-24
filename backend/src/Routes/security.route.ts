import { Router } from "express";
import { states } from "..";

const securityRouter = Router();

securityRouter.post("/", (req, res) => {
    const { id, state }: { id: string, state: "on" | "off" } = req.body;

    const securityDevice = states.security.find(sec => sec.id === id);
    if (!securityDevice)
        return res.status(404).json({ success: false, message: "Specified Security option doesn't exists." });
    securityDevice.isOn = state === "on";
    console.log(`Security device ${securityDevice.name} is now ${securityDevice.isOn ? "on" : "off"}`);
    res.status(200).json({ success: true, id, state });
});

export default securityRouter;