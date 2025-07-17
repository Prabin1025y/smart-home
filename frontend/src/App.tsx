import HomePage, { fetchData, type DataType } from "./pages/HomePage"
import io from 'socket.io-client';
import { useEffect } from 'react';
import useStore from "./lib/zustand";
import { useQuery } from "@tanstack/react-query";

function App() {
  const { setTemperature, setHumidity, setStateData } = useStore();
  const { data, refetch, isSuccess } = useQuery<DataType>({
    queryKey: ["devices"],
    queryFn: fetchData,
    staleTime: Infinity, // Prevent refetching unless explicitly called
  });

  useEffect(() => {
    if (isSuccess && data) {
      setStateData(data);
    }
  }, [data])
  

  useEffect(() => {
    const socket = io('http://localhost:3000');

    const handleTemperatureUpdate = (data: { temperature: number; humidity: number }) => {
      setTemperature(data.temperature);
      setHumidity(data.humidity);
    }

    socket.on("temperatureUpdate", handleTemperatureUpdate);
    socket.on("stateChanged", () => {
      refetch();
    });

    return () => {
      socket.off("temperatureUpdate", handleTemperatureUpdate);
      socket.off("stateChanged");
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <HomePage />
    </>
  )
}

export default App
