import { io, Socket } from 'socket.io-client';

export interface SensorData {
  id: string;
  type: 'tide_gauge' | 'weather_station' | 'water_quality' | 'seismic';
  location: { lat: number; lng: number; name: string };
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
}

export interface ThreatAlert {
  id: string;
  type: 'storm_surge' | 'erosion' | 'pollution' | 'cyclone' | 'tsunami';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number; name: string };
  description: string;
  timestamp: Date;
  estimatedImpact: Date;
  affectedAreas: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'emergency_manager' | 'government' | 'ngo' | 'fisherfolk' | 'civil_defense';
  organization: string;
  permissions: string[];
}

class CoastalAPI {
  private socket: Socket | null = null;
  private baseUrl = 'https://api.coastal-alert.system';

  // Mock data generators
  generateMockSensorData(): SensorData[] {
    const locations = [
      { lat: 13.0827, lng: 80.2707, name: 'Chennai Coast' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai Coast' },
      { lat: 15.2993, lng: 74.1240, name: 'Goa Coast' },
      { lat: 11.9416, lng: 79.8083, name: 'Puducherry Coast' },
      { lat: 8.5241, lng: 76.9366, name: 'Kerala Coast' }
    ];

    return locations.flatMap(location => [
      {
        id: `tide_${location.name.replace(' ', '_')}`,
        type: 'tide_gauge' as const,
        location,
        value: Math.random() * 3 + 1,
        unit: 'meters',
        timestamp: new Date(),
        status: Math.random() > 0.8 ? 'warning' : 'normal' as const
      },
      {
        id: `weather_${location.name.replace(' ', '_')}`,
        type: 'weather_station' as const,
        location,
        value: Math.random() * 50 + 20,
        unit: 'km/h',
        timestamp: new Date(),
        status: Math.random() > 0.9 ? 'critical' : 'normal' as const
      },
      {
        id: `quality_${location.name.replace(' ', '_')}`,
        type: 'water_quality' as const,
        location,
        value: Math.random() * 100,
        unit: 'ppm',
        timestamp: new Date(),
        status: Math.random() > 0.85 ? 'warning' : 'normal' as const
      }
    ]);
  }

  generateMockAlerts(): ThreatAlert[] {
    return [
      {
        id: 'alert_001',
        type: 'storm_surge',
        severity: 'high',
        location: { lat: 13.0827, lng: 80.2707, name: 'Chennai Coast' },
        description: 'Severe storm surge expected due to cyclonic activity',
        timestamp: new Date(),
        estimatedImpact: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedAreas: ['Chennai Port', 'Marina Beach', 'Ennore Creek']
      },
      {
        id: 'alert_002',
        type: 'erosion',
        severity: 'medium',
        location: { lat: 15.2993, lng: 74.1240, name: 'Goa Coast' },
        description: 'Accelerated coastal erosion detected',
        timestamp: new Date(),
        estimatedImpact: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedAreas: ['Calangute Beach', 'Baga Beach']
      }
    ];
  }

  // NOAA API Integration (Mock)
  async fetchNOAAData(): Promise<SensorData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'noaa_buoy_001',
        type: 'weather_station',
        location: { lat: 13.0827, lng: 80.2707, name: 'NOAA Buoy 001' },
        value: 2.5,
        unit: 'meters',
        timestamp: new Date(),
        status: 'normal'
      }
    ];
  }

  // INCOIS API Integration (Mock)
  async fetchINCOISData(): Promise<SensorData[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'incois_station_001',
        type: 'tide_gauge',
        location: { lat: 19.0760, lng: 72.8777, name: 'INCOIS Mumbai Station' },
        value: 1.8,
        unit: 'meters',
        timestamp: new Date(),
        status: 'normal'
      }
    ];
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onDataUpdate: (data: SensorData) => void, onAlertUpdate: (alert: ThreatAlert) => void) {
    // Mock WebSocket with periodic updates
    setInterval(() => {
      const mockData = this.generateMockSensorData()[0];
      onDataUpdate(mockData);
    }, 5000);

    setInterval(() => {
      if (Math.random() > 0.95) {
        const mockAlert = this.generateMockAlerts()[0];
        onAlertUpdate(mockAlert);
      }
    }, 10000);
  }

  // ML Threat Detection
  async detectThreats(sensorData: SensorData[]): Promise<ThreatAlert[]> {
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const threats: ThreatAlert[] = [];
    
    sensorData.forEach(data => {
      if (data.type === 'tide_gauge' && data.value > 2.5) {
        threats.push({
          id: `ml_threat_${Date.now()}`,
          type: 'storm_surge',
          severity: data.value > 3 ? 'critical' : 'high',
          location: data.location,
          description: `Abnormal tide level detected: ${data.value}${data.unit}`,
          timestamp: new Date(),
          estimatedImpact: new Date(Date.now() + 2 * 60 * 60 * 1000),
          affectedAreas: [`${data.location.name} vicinity`]
        });
      }
      
      if (data.type === 'weather_station' && data.value > 60) {
        threats.push({
          id: `ml_threat_${Date.now()}_wind`,
          type: 'cyclone',
          severity: data.value > 80 ? 'critical' : 'high',
          location: data.location,
          description: `High wind speeds detected: ${data.value}${data.unit}`,
          timestamp: new Date(),
          estimatedImpact: new Date(Date.now() + 4 * 60 * 60 * 1000),
          affectedAreas: [`${data.location.name} region`]
        });
      }
    });
    
    return threats;
  }

  // User Authentication (Mock)
  async authenticateUser(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: User[] = [
      {
        id: 'user_001',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@emergency.gov.in',
        role: 'emergency_manager',
        organization: 'National Disaster Management Authority',
        permissions: ['view_all', 'create_alerts', 'manage_users']
      },
      {
        id: 'user_002',
        name: 'Priya Sharma',
        email: 'priya@coastal.ngo',
        role: 'ngo',
        organization: 'Coastal Conservation Society',
        permissions: ['view_data', 'create_reports']
      }
    ];
    
    return mockUsers.find(user => user.email === email) || null;
  }

  // Historical data analysis
  async getHistoricalData(startDate: Date, endDate: Date): Promise<SensorData[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const data: SensorData[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        id: `historical_${i}`,
        type: 'tide_gauge',
        location: { lat: 13.0827, lng: 80.2707, name: 'Chennai Coast' },
        value: Math.sin(i * 0.1) * 0.5 + 2 + Math.random() * 0.2,
        unit: 'meters',
        timestamp: date,
        status: 'normal'
      });
    }
    
    return data;
  }
}

export const coastalAPI = new CoastalAPI();