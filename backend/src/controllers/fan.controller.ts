import { StatesType } from "..";

type turnOnFanParams = {
    id: string;
    onOffDate?: {
        on: Date | null; // Optional field for the date when the fan was turned on
        off: Date | null; // Optional field for the date when the fan was turned off
    };
    onOffTemperature?: {
        on: number | null; // Optional field for the temperature at which the fan turns on
        off: number | null; // Optional field for the temperature at which the fan turns off
    };
}

export const turnOnFan = async (params: turnOnFanParams) => {
    const { id, onOffDate, onOffTemperature } = params;

    // Find the fan in the state
    const fan = states.fans.find(f => f.id === id);
    if (!fan) throw new Error("Fan not found");

    // Update the fan's state
    fan.isOn = true;
    fan.onOffDate = { ...fan.onOffDate, on: onOffDate?.on || new Date() };
    fan.onOffTemperature = { ...fan.onOffTemperature, on: onOffTemperature?.on || null };

    // Emit the state change
    io.emit("stateChanged");

    return fan;
}