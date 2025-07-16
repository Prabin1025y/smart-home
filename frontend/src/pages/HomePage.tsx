import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Fan, Shield, Thermometer, Droplets, Camera, DoorOpen, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSuspenseQuery } from "@tanstack/react-query"

// Mock data for devices
// const initialDevices = {
//     lights: [
//         { id: "livingRoom", name: "Living Room", location: "Main Floor", isOn: true },
//         { id: "kitchen", name: "Kitchen", location: "Main Floor", isOn: false },
//         { id: "bedroom", name: "Master Bedroom", location: "Second Floor", isOn: true },
//         { id: "office", name: "Office", location: "Second Floor", isOn: false },
//         { id: "bathroom", name: "Bathroom", location: "Main Floor", isOn: false },
//         { id: "outside", name: "Outside", location: "Ground Floor", isOn: true },
//     ],
//     fans: [
//         { id: "livingRoom", name: "Living Room Fan", location: "Main Floor", isOn: true, speed: "Medium" },
//         { id: "bedroom", name: "Bedroom Fan", location: "Second Floor", isOn: false, speed: "Off" },
//         { id: "kitchen", name: "Kitchen Fan", location: "Main Floor", isOn: true, speed: "High" },
//         { id: "office", name: "Office Fan", location: "Second Floor", isOn: false, speed: "Off" },
//     ],
//     security: [
//         { id: "gate", name: "Main Gate", type: "gate", isOn: false },
//     ],
// }

type DataType = {
    success: string,
    states: {
        lights: {
            id: string;
            name: string;
            location: string;
            isOn: boolean;
        }[];
        fans: {
            id: string;
            name: string;
            location: string;
            isOn: boolean;
            speed: string;
        }[];
        security: {
            id: string;
            name: string;
            type: string;
            isOn: boolean;
        }[];
    }
}

const fetchData = async () => {
    const response = await fetch('http://localhost:3000/api/status')
    return await response.json()
}

export default function HomePage() {
    const [temperature] = useState(24)
    const [humidity] = useState(65)

    const { data, isLoading, error, refetch, isSuccess, } = useSuspenseQuery<DataType>({
        queryKey: ['devices'],
        queryFn: fetchData
    })


    const toggleDevice = async (category: keyof typeof data.states, deviceId: string) => {
        const currentState = data.states[category].find(e => e.id === deviceId)?.isOn;
        const response = await fetch(`http://localhost:3000/api/${category}?id=${deviceId}&state=${currentState ? 'off' : 'on'}`);
        const result = await response.json();
        if (result.success) {
            await refetch();
        } else {
            alert("Failed to toggle device state. Please try again.");
        }
    }

    //todo
    const turnOffAllDevices = async() => {
        // alert("This feature is not implemented yet.");
        const response = await fetch("http://localhost:3000/api/turn-off");
        const result = await response.json();
        if (result.success) {
            refetch();
        }else{
            alert("Failed to turn off all devices. Please try again.");
        }
    }

    const DeviceCard = ({ device, category, icon: Icon }: { device: any; category: keyof typeof data.states; icon: any }) => (
        <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
                    <div className="flex items-center space-x-4">
                        <div
                            className={`p-3 sm:p-2 rounded-full ${device.isOn ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                        >
                            <Icon className="h-6 w-6 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-base sm:text-sm">{device.name}</h3>
                            <p className="text-sm sm:text-xs text-muted-foreground">
                                {device.location || (device.type === "gate" ? "Entrance" : "Security")}
                            </p>
                            {category === "fans" && (
                                <Badge variant={device.isOn ? "default" : "secondary"} className="text-xs mt-2 sm:mt-1">
                                    {device.speed}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Large switch area, Desktop: Compact */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-2">
                        <div className="flex items-center space-x-3 sm:space-x-2">
                            <span className={`text-sm font-medium ${device.isOn ? "text-green-600" : "text-red-600"}`}>
                                {device.isOn ? "ON" : "OFF"}
                            </span>
                            <div className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full ${device.isOn ? "bg-green-500" : "bg-red-500"}`} />
                        </div>
                        <Switch
                            checked={device.isOn}
                            onCheckedChange={() => toggleDevice(category, device.id)}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 scale-125 sm:scale-100"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (isLoading || !isSuccess) return <div>Loading...</div>

    if (error) return <div>Error loading devices</div>

    return (
        <div className="min-h-screen bg-blue-50/30">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Home className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Smart Home Dashboard</h1>
                                <p className="text-sm text-gray-500">Manage your connected devices</p>
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
                                        <div className="text-3xl font-bold text-blue-900">{temperature}°C</div>
                                        <div className="text-sm text-blue-600">Temperature</div>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-blue-200" />
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-cyan-500 rounded-full">
                                        <Droplets className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-cyan-900">{humidity}%</div>
                                        <div className="text-sm text-cyan-600">Humidity</div>
                                    </div>
                                </div>
                            </div>

                            {/* Master Switch */}
                            <Button
                                onClick={turnOffAllDevices}
                                variant="destructive"
                                size="lg"
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <span className="text-lg">⚡</span>
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
                                <h2 className="text-lg font-semibold text-gray-900">Lighting Control</h2>
                                <p className="text-sm text-gray-500">
                                    {data.states.lights.filter((light) => light.isOn).length} of {data.states.lights.length} lights are on
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {data.states.lights.filter((light) => light.isOn).length} Active
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {data.states.lights.map((light) => (
                                <DeviceCard key={light.id} device={light} category="lights" icon={Lightbulb} />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Fans Tab */}
                    <TabsContent value="fans" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Fan Control</h2>
                                <p className="text-sm text-gray-500">
                                    {data.states.fans.filter((fan) => fan.isOn).length} of {data.states.fans.length} fans are running
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {data.states.fans.filter((fan) => fan.isOn).length} Running
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {data.states.fans.map((fan) => (
                                <DeviceCard key={fan.id} device={fan} category="fans" icon={Fan} />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Security Control</h2>
                                <p className="text-sm text-gray-500">
                                    {data.states.security.filter((device) => device.isOn).length} of {data.states.security.length} security
                                    devices are active
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {data.states.security.filter((device) => device.isOn).length} Active
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {data.states.security.map((device) => (
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
                                {data.states.lights.filter((light) => light.isOn).length}/{data.states.lights.length}
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
                                {data.states.fans.filter((fan) => fan.isOn).length}/{data.states.fans.length}
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
                                {data.states.security.filter((device) => device.isOn).length}/{data.states.security.length}
                            </div>
                            <p className="text-xs text-muted-foreground">Devices active</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
