import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Fan,
  Shield,
  Thermometer,
  Droplets,
  Camera,
  DoorOpen,
  Home,
  Settings,
  Clock,
  Loader,
  Sun,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import useStore from "@/lib/zustand";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

export type DataType = {
  success: boolean;
  states: {
    lights: {
      id: string;
      name: string;
      location: string;
      isOn: boolean;
      turnedOnAt?: Date | null; // Optional field for when the light was turned on
      turnOffAt?: Date | null; // Optional field for when the light was turned off
      speed?: number;
    }[];
    fans: {
      id: string;
      name: string;
      location: string;
      isOn: boolean;
      speed?: number;
      turnedOnAt?: Date | null; // Optional field for when the fan was turned on
      turnOffAt?: Date | null; // Optional field for when the fan was turned off
      turnOnTemperature?: number | null; // Optional field for the temperature when the fan was turned on
      turnOffTemperature?: number | null; // Optional field for the temperature when the fan was
    }[];
    security: {
      id: string;
      name: string;
      type: string;
      isOn: boolean;
    }[];
  };
};

export const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/status");
    // console.log(response)
    return await response.json();
  } catch (error) {
    toast.error("Server error. Please try again later.");
  }
};

export default function HomePage() {

  const { data, refetch, isSuccess } = useQuery<DataType>({
    queryKey: [ "devices" ],
    queryFn: fetchData,
    staleTime: Infinity, // Prevent refetching unless explicitly called
  });
  const { temperature, humidity, stateData, setStateData } = useStore();

  const [ loading, setLoading ] = useState(true);
  useEffect(() => {
    if (isSuccess && data) {
      setStateData(data);
      setLoading(false);
    }
  }, [ data ])


  // console.log(data, isLoading, isError, isSuccess);

  const toggleDevice = async (
    category: keyof DataType[ "states" ],
    deviceId: string,
    isScheduled: boolean = false,
    timer: number = 30,
    minTemp: number = 22,
    maxTemp: number = 28,
    isTemperatureControlled: boolean = false
  ) => {
    const currentState = data?.states[ category ].find(
      (e) => e.id === deviceId
    )?.isOn;
    setLoading(true);
    const response = await fetch(`http://localhost:3000/api/${category}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: deviceId,
        state: currentState ? "off" : "on",
        turnOffDate: isScheduled ? Date.now() + timer * 60000 : null,
        minTemp: isTemperatureControlled ? minTemp : null,
        maxTemp: isTemperatureControlled ? maxTemp : null,
      })
    })
    const result = await response.json();
    if (result.success) {
      await refetch();
    } else {
      toast.error("Request Failed. Please try again.");
    }
    setLoading(false);
  };

  const turnOffAllDevices = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:3000/api/turn-off");
    const result = await response.json();
    if (result.success) {
      await refetch();
      toast.success("All devices turned off");
    } else {
      toast.error("Failed to turn off all devices. Please try again.");
    }
    setLoading(false);
  };

  const DeviceCard = ({
    device,
    category,
    icon: Icon,
  }: {
    device: any;
    category: keyof DataType[ "states" ];
    icon: any;
  }) => {
    const [ timerValue, setTimerValue ] = useState(30);
    const [ isScheduled, setIsScheduled ] = useState(false);
    const [ isTemperatureControlled, setIsTemperatureControlled ] = useState(false);
    const [ maxTemp, setMaxTemp ] = useState(28);
    const [ minTemp, setMinTemp ] = useState(22);
    const [ intensityInfo, setIntensityInfo ] = useState<{ value: number; isEnabled: boolean }>({
      value: device.brightness || device.speed || 255,
      isEnabled: false
    });


    const handleSetIntensity = async () => {
      setLoading(true);

      const response = await fetch(`http://localhost:3000/api/${category}/intensity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: device.id,
          intensity: intensityInfo.isEnabled ? intensityInfo.value : 255,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await refetch();
      } else {
        toast.error("Failed to set Intensity. Please try again.");
      }
      setLoading(false);
    }

    return (
      <Card className="transition-all gap-0 duration-200 hover:shadow-md">
        <CardContent className="p-4 pb-2 sm:p-6 sm:pb-3">
          {/* Device Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${device.isOn
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{device.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {device.location ||
                    (device.type === "gate" ? "Entrance" : "Security")}
                </p>
              </div>
            </div>

            {/* Status and Switch */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-medium ${device.isOn ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {device.isOn ? "ON" : "OFF"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${device.isOn ? "bg-green-500" : "bg-red-500"
                    }`}
                />
              </div>
              <Switch
                checked={device.isOn}
                disabled={loading}
                onCheckedChange={() => toggleDevice(category, device.id, isScheduled, timerValue, minTemp, maxTemp, isTemperatureControlled)}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Fan Speed Badge */}
          <div className="mb-4 flex gap-4">
            {category !== "security" && !device.isOn && (
              <>
                <div className="flex items-start gap-3">
                  <Checkbox className="cursor-pointer" checked={isScheduled} id={`schedule-${device.id}`} onCheckedChange={(checked) => setIsScheduled(checked ? true : false)} />
                  <Label htmlFor={`schedule-${device.id}`} className="text-xs font-medium cursor-pointer">
                    Schedule
                  </Label>
                </div>
                {category === "fans" && <div className="flex items-start gap-3">
                  <Checkbox className="cursor-pointer" id={`temp-${device.id}`} checked={isTemperatureControlled} onCheckedChange={(checked) => setIsTemperatureControlled(checked ? true : false)} />
                  <Label htmlFor={`temp-${device.id}`} className="text-xs font-medium cursor-pointer">
                    Temperature Control
                  </Label>
                </div>}

              </>
            )}
            {category !== "security" && <div className="flex items-start gap-3">
              <Checkbox
                className="cursor-pointer"
                checked={intensityInfo.isEnabled}
                id={`intensity-${device.id}`}
                onCheckedChange={(checked) => setIntensityInfo({ ...intensityInfo, isEnabled: checked ? true : false })}

              />
              <Label htmlFor={`intensity-${device.id}`} className="text-xs font-medium cursor-pointer">
                {category === "lights" ? "Brightness" : "Speed"}
              </Label>
            </div>}
          </div>

          {/* Intensity Section */}
          {category !== "security" && intensityInfo.isEnabled &&
            <>
              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  {category === "lights" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Wind className="h-4 w-4 text-muted-foreground" />}
                  <Label className="text-xs font-medium">{category === "lights" ? "Brightness" : "Speed"}</Label>
                </div>
                <div className="flex space-x-2">
                  {/* <Input
                    type="number"
                    placeholder="30"
                    value={timerValue}
                    onChange={(e) => setTimerValue(Number(e.target.value))}
                    className="h-8 text-xs"
                    min="0"
                  /> */}
                  <Slider
                    value={[ intensityInfo.value ]}
                    onValueChange={(value) => setIntensityInfo({ value: value[ 0 ], isEnabled: intensityInfo.isEnabled })}
                    max={255}
                    min={1}
                    step={1}
                  />
                  <Button className="cursor-pointer" onClick={handleSetIntensity}>Set</Button>
                </div>
              </div>
            </>
          }
          {category !== "security" && isScheduled &&
            <>
              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs font-medium">Timer (minutes)</Label>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="30"
                    value={timerValue}
                    onChange={(e) => setTimerValue(Number(e.target.value))}
                    className="h-8 text-xs"
                    min="0"
                  />
                </div>
              </div>
            </>
          }

          {/* Temperature Section (Only for Fans) */}
          {category === "fans" && isTemperatureControlled && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs font-medium">
                    Temperature Range (°C)
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      placeholder="18"
                      value={minTemp}
                      onChange={(e) => setMinTemp(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      placeholder="26"
                      value={maxTemp}
                      onChange={(e) => setMaxTemp(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start text-xs text-red-500">
          {category !== "security" && <p>{category === "fans" ? "Speed" : "Brightness"}: {Math.round((intensityInfo.value / 255) * 100)}</p>}
          <div className="flex justify-between items-center w-full">
            {device.onOffDate?.off
              && <p>Turn off at: {new Date(device.onOffDate.off).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            {device.onOffTemperature?.off && <p>Turn off at: {device.onOffTemperature.off}&deg;C</p>}
            {device.onOffTemperature?.on && <p>Turn on at: {device.onOffTemperature.on}&deg;C</p>}
          </div>
        </CardFooter>
      </Card>
    )
  };

  if (stateData.states.lights.length === 0)
    return <div className="absolute inset-0 flex items-center justify-center">
      <Loader className="text-cyan-500 animate-spin size-24" />
    </div>;

  // if (isError) return <div>Error loading devices</div>;

  return (
    <div className="min-h-screen bg-blue-50/30">
      {loading && <div className="bg-black/20 fixed inset-0 grid place-items-center z-10"><Loader className="text-cyan-500 animate-spin size-10" /></div>}
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Smart Home Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your connected devices
                </p>
              </div>
            </div>

            {/* Large Temperature and Humidity Display */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4  px-6 py-4 ">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Thermometer className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-900">
                      {temperature}°C
                    </div>
                    <div className="text-sm text-blue-600">Temperature</div>
                  </div>
                </div>
                <div className="w-px h-12 bg-blue-200" />
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-cyan-500 rounded-full">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-900">
                      {humidity}%
                    </div>
                    <div className="text-sm text-cyan-600">Humidity</div>
                  </div>
                </div>
              </div>

              {/* Master Switch */}
              <Button
                onClick={turnOffAllDevices}
                variant="destructive"
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                {/* <Power className="font-extrabold h-5 w-5 mr-2" /> */}
                <span className="text-lg brightness-0 invert">⚡</span>
              </Button>

              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="lights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white border border-blue-200 shadow-sm">
            <TabsTrigger
              value="lights"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Lights</span>
            </TabsTrigger>
            <TabsTrigger
              value="fans"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Fan className="h-4 w-4" />
              <span>Fans</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Lights Tab */}
          <TabsContent value="lights" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Lighting Control
                </h2>
                <p className="text-sm text-gray-500">
                  {stateData.states.lights.filter((light) => light.isOn).length} of{" "}
                  {stateData.states.lights.length} lights are on
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {stateData.states.lights.filter((light) => light.isOn).length} Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stateData.states.lights.map((light) => (
                <DeviceCard
                  key={light.id}
                  device={light}
                  category="lights"
                  icon={Lightbulb}
                />
              ))}
            </div>
          </TabsContent>

          {/* Fans Tab */}
          <TabsContent value="fans" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Fan Control
                </h2>
                <p className="text-sm text-gray-500">
                  {stateData.states.fans.filter((fan) => fan.isOn).length} of{" "}
                  {stateData.states.fans.length} fans are running
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {stateData.states.fans.filter((fan) => fan.isOn).length} Running
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stateData.states.fans.map((fan) => (
                <DeviceCard
                  key={fan.id}
                  device={fan}
                  category="fans"
                  icon={Fan}
                />
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Security Control
                </h2>
                <p className="text-sm text-gray-500">
                  {stateData.states.security.filter((device) => device.isOn).length}{" "}
                  of {stateData.states.security.length} security devices are active
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {stateData.states.security.filter((device) => device.isOn).length}{" "}
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stateData.states.security.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  category="security"
                  icon={device.type === "gate" ? DoorOpen : Camera}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span>Total Lights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stateData.states.lights.filter((light) => light.isOn).length}/
                {stateData.states.lights.length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Fan className="h-4 w-4 text-blue-500" />
                <span>Total Fans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stateData.states.fans.filter((fan) => fan.isOn).length}/
                {stateData.states.fans.length}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stateData.states.security.filter((device) => device.isOn).length}/
                {stateData.states.security.length}
              </div>
              <p className="text-xs text-muted-foreground">Devices active</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
