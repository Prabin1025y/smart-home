

setInterval(async() => {
    // Fetch the current states from the server
    const response = await fetch("http://localhost:3000/api/status");
    const data = await response.json();

    if (data.success) {
        // Update fan states
        data.states.fans.forEach(fan => {
            const fanElement = document.getElementById(`${fan.id}Fan`);
            if (fanElement) {
                fanElement.classList.toggle("animate-spin", fan.isOn);
            }
        });

        // Update light states
        data.states.lights.forEach(light => {
            const lightElement = document.getElementById(`${light.id}Light`);
            if (lightElement) {
                lightElement.classList.toggle("bg-green-500", light.isOn);
                lightElement.textContent = light.isOn ? "ON" : "OFF";
            }
        });

        // Update main gate state
        const gateElement = document.getElementById("mainGate");
        if (gateElement) {
            gateElement.classList.toggle("bg-green-500", data.states.security[0].isOn);
            gateElement.textContent = data.states.security[0].isOn ? "OPENED" : "CLOSED";
        }
    }
}, 2000);
