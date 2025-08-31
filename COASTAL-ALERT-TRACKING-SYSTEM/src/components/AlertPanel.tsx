import React, { useState } from 'react';
import { ThreatAlert, User } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Bell, Send, Phone, Mail, MessageSquare, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

interface AlertPanelProps {
  alerts: ThreatAlert[];
  currentUser: User | null;
  onAlertUpdate: (alertId: string, status: string) => void;
  onSendNotification: (alertId: string, channels: string[], message: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts, 
  currentUser, 
  onAlertUpdate, 
  onSendNotification 
}) => {
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'storm_surge': return '🌊';
      case 'erosion': return '🏖️';
      case 'pollution': return '☣️';
      case 'cyclone': return '🌀';
      case 'tsunami': return '🌊';
      default: return '⚠️';
    }
  };

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filterSeverity);

  const activeAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const totalAffectedAreas = [...new Set(alerts.flatMap(alert => alert.affectedAreas))].length;

  const handleSendNotification = () => {
    if (selectedAlert && notificationMessage && selectedChannels.length > 0) {
      onSendNotification(selectedAlert.id, selectedChannels, notificationMessage);
      setNotificationMessage('');
      setSelectedChannels([]);
    }
  };

  const generateAutoMessage = (alert: ThreatAlert) => {
    return `COASTAL THREAT ALERT\n\nType: ${alert.type.replace('_', ' ').toUpperCase()}\nSeverity: ${alert.severity.toUpperCase()}\nLocation: ${alert.location.name}\nDescription: ${alert.description}\nEstimated Impact: ${format(alert.estimatedImpact, 'PPpp')}\nAffected Areas: ${alert.affectedAreas.join(', ')}\n\nPlease take necessary precautions and follow emergency protocols.`;
  };

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalAffectedAreas}</div>
                <div className="text-sm text-gray-600">Affected Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Management System
            </CardTitle>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Alerts</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No alerts matching the current filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getThreatIcon(alert.type)}</span>
                          <div>
                            <h4 className="font-semibold capitalize">
                              {alert.type.replace('_', ' ')} Alert
                            </h4>
                            <p className="text-sm text-gray-600">{alert.location.name}</p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-3">{alert.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Impact: {format(alert.estimatedImpact, 'PPp')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Areas: {alert.affectedAreas.length}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Send Alert
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Send Emergency Notification</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Notification Channels</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {['SMS', 'Email', 'Push', 'Voice'].map((channel) => (
                                    <Button
                                      key={channel}
                                      variant={selectedChannels.includes(channel) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        setSelectedChannels(prev => 
                                          prev.includes(channel)
                                            ? prev.filter(c => c !== channel)
                                            : [...prev, channel]
                                        );
                                      }}
                                    >
                                      {channel === 'SMS' && <Phone className="w-4 h-4 mr-1" />}
                                      {channel === 'Email' && <Mail className="w-4 h-4 mr-1" />}
                                      {channel === 'Push' && <Bell className="w-4 h-4 mr-1" />}
                                      {channel === 'Voice' && <MessageSquare className="w-4 h-4 mr-1" />}
                                      {channel}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                  value={notificationMessage}
                                  onChange={(e) => setNotificationMessage(e.target.value)}
                                  placeholder="Enter custom message or use auto-generated..."
                                  className="mt-2"
                                  rows={4}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setNotificationMessage(generateAutoMessage(alert))}
                                >
                                  Use Auto Message
                                </Button>
                              </div>
                              
                              <Button 
                                onClick={handleSendNotification}
                                disabled={selectedChannels.length === 0 || !notificationMessage}
                                className="w-full"
                              >
                                Send Notification
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Select onValueChange={(value) => onAlertUpdate(alert.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="acknowledged">Acknowledged</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notification Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>SMS Sent Today</span>
                          <span className="font-mono">247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emails Delivered</span>
                          <span className="font-mono">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Push Notifications</span>
                          <span className="font-mono">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate</span>
                          <span className="font-mono text-green-600">98.2%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Storm surge alert - Chennai (SMS)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Water quality warning - Goa (Email)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Erosion alert - Kerala (Push)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  Showing alert history for the past 30 days
                </div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Storm Surge Alert - Resolved</span>
                      <Badge variant="outline">Resolved</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Mumbai Coast - {index + 1} days ago</p>
                      <p>Duration: 4 hours | Notifications sent: 156</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};