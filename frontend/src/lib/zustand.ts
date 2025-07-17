import type { DataType } from '@/pages/HomePage'
import { create } from 'zustand'

export type Store = {
  temperature: number
  humidity: number
  stateData: DataType
  setTemperature: (temp: number) => void
  setHumidity: (hum: number) => void
  setStateData: (data: DataType) => void
}

const useStore = create<Store>()((set) => ({
  temperature: 24,
  humidity: 65,
  stateData: {
    success: false,
    states: {
      lights: [],
      fans: [],
      security: []
    }
  },
  setTemperature: (temp) => set({ temperature: temp }),
  setHumidity: (hum) => set({ humidity: hum }),
  setStateData: (data) => {
    set({ stateData: data });
    console.log("State data updated", data);
  },
}))

export default useStore
