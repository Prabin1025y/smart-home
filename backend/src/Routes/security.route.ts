import { Router } from "express";
import { states } from "..";

const securityRouter = Router();

securityRouter.get("/", (req, res) => {
    const id = req.query.id;
    const state = req.query.state;

    if (typeof id === "string" && typeof state === "string" && (state === "on" || state === "off")) {
        const securityDevice = states.security.find(sec => sec.id === id);
        if (!securityDevice)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });
        securityDevice.isOn = state === "on";
        console.log(`Security device ${securityDevice.name} is now ${securityDevice.isOn ? "on" : "off"}`);
        res.status(200).json({ success: true, id, state });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
});

export default securityRouter;