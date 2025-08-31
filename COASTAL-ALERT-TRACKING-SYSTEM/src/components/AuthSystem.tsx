import React, { useState, createContext, useContext, useEffect } from 'react';
import { User, coastalAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User as UserIcon, LogOut, Settings, Eye, EyeOff } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('coastal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await coastalAPI.authenticateUser(email, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('coastal_user', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coastal_user');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      // Login successful, user will be updated in context
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  const demoUsers = [
    { email: 'rajesh@emergency.gov.in', role: 'Emergency Manager', org: 'NDMA' },
    { email: 'priya@coastal.ngo', role: 'NGO Staff', org: 'Coastal Conservation Society' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Coastal Alert System</CardTitle>
          <p className="text-gray-600">Secure Access Portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-3">Demo Accounts:</div>
            <div className="space-y-2">
              {demoUsers.map((demo, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{demo.email}</div>
                  <div className="text-gray-600">{demo.role} - {demo.org}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword('demo123');
                    }}
                  >
                    Use This Account
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { logout, hasPermission } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'emergency_manager': return 'bg-red-100 text-red-800';
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'ngo': return 'bg-green-100 text-green-800';
      case 'fisherfolk': return 'bg-yellow-100 text-yellow-800';
      case 'civil_defense': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'emergency_manager': return 'Emergency Manager';
      case 'government': return 'Government Official';
      case 'ngo': return 'NGO Staff';
      case 'fisherfolk': return 'Fisherfolk Representative';
      case 'civil_defense': return 'Civil Defense';
      default: return role;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge className={`${getRoleColor(user.role)} mt-1`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Organization</Label>
                <p className="text-sm text-gray-700 mt-1">{user.organization}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm text-gray-700 mt-1 font-mono">{user.id}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Access Permissions</Label>
              <div className="space-y-2">
                {user.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Role Capabilities</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {user.role === 'emergency_manager' && (
                  <>
                    <div>• Full system access and control</div>
                    <div>• Create and manage alerts</div>
                    <div>• User management capabilities</div>
                  </>
                )}
                {user.role === 'ngo' && (
                  <>
                    <div>• View sensor data and reports</div>
                    <div>• Create environmental reports</div>
                    <div>• Limited alert creation</div>
                  </>
                )}
                {user.role === 'government' && (
                  <>
                    <div>• Policy and planning access</div>
                    <div>• Regional data oversight</div>
                    <div>• Inter-agency coordination</div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};