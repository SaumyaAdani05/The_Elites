import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SensorData, ThreatAlert } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatBotProps {
  sensorData: SensorData[];
  alerts: ThreatAlert[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatBot: React.FC<ChatBotProps> = ({ sensorData, alerts }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const avatarRef = useRef<THREE.Group>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI coastal monitoring assistant. I can help you analyze sensor data, understand threat patterns, and provide insights about coastal conditions. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Initialize 3D avatar
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    camera.position.set(0, 0, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 200);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create avatar
    const avatarGroup = new THREE.Group();
    avatarRef.current = avatarGroup;

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.5;
    head.castShadow = true;
    avatarGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.6, 0.3);
    avatarGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.6, 0.3);
    avatarGroup.add(rightEye);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.2;
    body.castShadow = true;
    avatarGroup.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0, 0);
    leftArm.rotation.z = Math.PI / 6;
    avatarGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 0, 0);
    rightArm.rotation.z = -Math.PI / 6;
    avatarGroup.add(rightArm);

    scene.add(avatarGroup);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle floating animation
      if (avatarRef.current) {
        avatarRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        avatarRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Generate AI responses based on coastal data
  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('tide') || message.includes('water level')) {
      const tideData = sensorData.filter(s => s.type === 'tide_gauge');
      const avgTide = tideData.reduce((sum, s) => sum + s.value, 0) / tideData.length;
      return `Current average tide level is ${avgTide.toFixed(2)} meters. ${tideData.some(s => s.status !== 'normal') ? 'Some stations are showing abnormal readings that require attention.' : 'All tide gauges are operating within normal parameters.'}`;
    }
    
    if (message.includes('wind') || message.includes('weather')) {
      const weatherData = sensorData.filter(s => s.type === 'weather_station');
      const maxWind = Math.max(...weatherData.map(s => s.value));
      return `Current maximum wind speed is ${maxWind.toFixed(1)} km/h. ${maxWind > 50 ? 'High wind conditions detected - monitoring for potential storm development.' : 'Wind conditions are within normal ranges.'}`;
    }
    
    if (message.includes('alert') || message.includes('threat')) {
      if (alerts.length === 0) {
        return 'No active threats detected. All coastal monitoring systems are showing normal conditions.';
      }
      const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
      return `Currently tracking ${alerts.length} active alerts. ${criticalAlerts > 0 ? `${criticalAlerts} are marked as critical and require immediate attention.` : 'All alerts are at manageable levels.'}`;
    }
    
    if (message.includes('quality') || message.includes('pollution')) {
      const qualityData = sensorData.filter(s => s.type === 'water_quality');
      const avgQuality = qualityData.reduce((sum, s) => sum + s.value, 0) / qualityData.length;
      return `Average water quality index is ${avgQuality.toFixed(1)} ppm. ${avgQuality < 50 ? 'Some areas showing concerning pollution levels.' : 'Water quality is within acceptable parameters.'}`;
    }
    
    if (message.includes('location') || message.includes('where')) {
      const locations = [...new Set(sensorData.map(s => s.location.name))];
      return `I'm monitoring ${locations.length} coastal locations: ${locations.join(', ')}. Each location has multiple sensor types providing real-time data.`;
    }
    
    if (message.includes('prediction') || message.includes('forecast')) {
      return 'Based on current patterns, I\'m analyzing tidal cycles, weather trends, and historical data to predict potential coastal threats. The ML models show varying confidence levels for different threat types across monitored locations.';
    }
    
    if (message.includes('help') || message.includes('what can you')) {
      return 'I can help you with: 📊 Real-time sensor data analysis, 🌊 Tide and weather monitoring, ⚠️ Threat alert explanations, 📈 Historical trend analysis, 🎯 ML prediction insights, and 📍 Location-specific information. Just ask me about any coastal monitoring topic!';
    }
    
    // Default responses
    const defaultResponses = [
      'I\'m analyzing the coastal data to provide you with the most accurate information. Could you be more specific about what you\'d like to know?',
      'Based on the current sensor readings, I can help you understand various aspects of coastal conditions. What specific data interests you?',
      'I have access to real-time data from multiple coastal monitoring stations. How can I assist with your coastal threat analysis?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          AI Coastal Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Avatar */}
        <div className="flex justify-center">
          <div 
            ref={mountRef} 
            className="border rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100"
            style={{ width: '300px', height: '200px' }}
          />
        </div>

        {/* Chat Messages */}
        <ScrollArea className="h-64 w-full border rounded-lg p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about coastal conditions..."
            className="flex-1"
          />
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "outline"}
            size="icon"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputText('What are the current tide levels?')}
          >
            Tide Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputText('Show me active alerts')}
          >
            Active Alerts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputText('Analyze weather patterns')}
          >
            Weather Analysis
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputText('Water quality report')}
          >
            Water Quality
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};