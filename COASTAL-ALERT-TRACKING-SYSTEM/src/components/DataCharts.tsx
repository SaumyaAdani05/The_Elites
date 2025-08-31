import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { SensorData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataChartsProps {
  sensorData: SensorData[];
  historicalData: SensorData[];
}

export const DataCharts: React.FC<DataChartsProps> = ({ sensorData, historicalData }) => {
  const processChartData = (data: SensorData[], type: string) => {
    return data
      .filter(d => d.type === type)
      .map(d => ({
        time: d.timestamp.toLocaleTimeString(),
        value: d.value,
        location: d.location.name,
        status: d.status
      }))
      .slice(-20);
  };

  const tideData = processChartData(sensorData, 'tide_gauge');
  const weatherData = processChartData(sensorData, 'weather_station');
  const qualityData = processChartData(sensorData, 'water_quality');

  const historicalTrend = historicalData.map(d => ({
    date: d.timestamp.toLocaleDateString(),
    value: d.value,
    trend: d.value > 2.2 ? 'High' : d.value < 1.8 ? 'Low' : 'Normal'
  }));

  const threatDistribution = sensorData.reduce((acc, sensor) => {
    const status = sensor.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const threatData = Object.entries(threatDistribution).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    fill: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981'
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="analysis">Threat Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tide Gauge Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tideData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wind Speed Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Water Quality Index</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Threat Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threatData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">30-Day Tide Level Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={historicalTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ML Threat Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Storm Surge Risk</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      High (85%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Coastal Erosion</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Medium (62%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Water Quality</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Normal (12%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Unusual tide pattern detected</p>
                      <p className="text-xs text-gray-600">Chennai Coast - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Temperature spike in water</p>
                      <p className="text-xs text-gray-600">Goa Coast - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Seismic activity correlation</p>
                      <p className="text-xs text-gray-600">Kerala Coast - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};