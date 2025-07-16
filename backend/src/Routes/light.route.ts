import { Router } from "express";
import { states } from "..";

const lightRouter = Router();

lightRouter.get("/", (req, res) => {
    const id = req.query.id;
    const state = req.query.state;

    if (typeof id === "string" && typeof state === "string" && (state === "on" || state === "off")) {
        const light = states.lights.find(lgt => lgt.id === id);
        if (!light)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });
        light.isOn = state === "on";
        res.status(200).json({ success: true, id, state });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
});

export default lightRouter;