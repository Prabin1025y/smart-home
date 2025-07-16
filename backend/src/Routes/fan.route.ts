import { Router } from "express";
import { states } from "..";

const fanRouter = Router();

fanRouter.get("/", (req, res) => {
    const id = req.query.id;
    const state = req.query.state;

    if (typeof id === "string" && typeof state === "string" && (state === "on" || state === "off")) {
        const fan = states.fans.find(fn => fn.id === id);
        if (!fan)
            return res.status(400).json({ success: false, message: "Invalid query parameters" });
        fan.isOn = state === "on";
        res.status(200).json({ success: true, id, state });
    } else {
        res.status(400).json({ success: false, message: "Invalid query parameters" });
    }
});

export default fanRouter;