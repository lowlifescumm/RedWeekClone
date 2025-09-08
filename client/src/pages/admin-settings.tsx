import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Mail, 
  Globe, 
  Database, 
  Save,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiRequest } from "@/lib/queryClient";
import type { SiteSetting } from "@shared/schema";

interface SettingFormData {
  key: string;
  value: string;
  category: string;
  description?: string;
  isEncrypted: boolean;
}

export default function AdminSettings() {
  const [newSetting, setNewSetting] = useState<SettingFormData>({
    key: '',
    value: '',
    category: 'general',
    description: '',
    isEncrypted: false
  });
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [smtpForm, setSmtpForm] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all settings
  const { data: settings = [], isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/admin/settings'],
  });

  // Initialize SMTP form when settings load
  useEffect(() => {
    if (settings.length > 0) {
      const smtpSettings = settings.filter(s => s.category === 'smtp');
      const formData: Record<string, string> = {};
      smtpSettings.forEach(setting => {
        formData[setting.key] = setting.value;
      });
      setSmtpForm(formData);
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  // Create setting mutation
  const createSettingMutation = useMutation({
    mutationFn: async (data: SettingFormData) => {
      const response = await apiRequest('POST', '/api/admin/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setNewSetting({ key: '', value: '', category: 'general', description: '', isEncrypted: false });
      toast({ title: "Setting created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create setting", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: Partial<SettingFormData> }) => {
      const response = await apiRequest('PUT', `/api/admin/settings/${key}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setEditingSetting(null);
      toast({ title: "Setting updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update setting", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('DELETE', `/api/admin/settings/${key}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({ title: "Setting deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete setting", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleCreateSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetting.key || !newSetting.value) {
      toast({ 
        title: "Validation Error", 
        description: "Key and value are required", 
        variant: "destructive" 
      });
      return;
    }
    createSettingMutation.mutate(newSetting);
  };

  const handleUpdateSetting = (setting: SiteSetting, updatedData: Partial<SettingFormData>) => {
    // Don't auto-save SMTP settings - they have their own form handling
    if (setting.category === 'smtp') {
      return;
    }
    
    updateSettingMutation.mutate({ 
      key: setting.key, 
      data: { ...updatedData, key: setting.key } 
    });
  };

  const handleSmtpFormChange = (key: string, value: string) => {
    setSmtpForm(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSmtpSettings = async () => {
    try {
      // Save all settings at once
      const savePromises = Object.entries(smtpForm).map(([key, value]) => {
        const setting = settings.find(s => s.key === key);
        if (setting && setting.value !== value) {
          return updateSettingMutation.mutateAsync({ 
            key, 
            data: { key, value, category: 'smtp', description: setting.description || '', isEncrypted: setting.isEncrypted } 
          });
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);
      setHasUnsavedChanges(false);
      toast({ title: "SMTP settings saved successfully!" });
    } catch (error) {
      toast({ 
        title: "Failed to save settings", 
        description: "Please try again", 
        variant: "destructive" 
      });
    }
  };

  const handleTestSmtpConnection = async () => {
    if (hasUnsavedChanges) {
      toast({ 
        title: "Save Settings First", 
        description: "Please save your SMTP settings before testing the connection.", 
        variant: "destructive" 
      });
      return;
    }

    setTestingSmtp(true);
    try {
      // Test SMTP connection with real backend endpoint
      const response = await apiRequest('POST', '/api/admin/smtp/test');
      const result = await response.json();
      
      if (result.success) {
        toast({ 
          title: "SMTP Test Successful!", 
          description: `${result.message} Email sent with message ID: ${result.messageId?.substring(0, 8) || 'N/A'}` 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('SMTP test error:', error);
      
      let errorMessage = "Please check your configuration and try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "SMTP Test Failed", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const categorizeSettings = () => {
    return settings.reduce((acc, setting) => {
      const category = setting.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(setting);
      return acc;
    }, {} as Record<string, SiteSetting[]>);
  };

  const categorizedSettings = categorizeSettings();

  // SMTP configuration quick setup
  const setupSMTPSettings = () => {
    const smtpSettings = [
      { key: 'smtp_host', value: '', description: 'SMTP Server Host (e.g., smtp.gmail.com)' },
      { key: 'smtp_port', value: '587', description: 'SMTP Server Port' },
      { key: 'smtp_username', value: '', description: 'SMTP Username/Email' },
      { key: 'smtp_password', value: '', description: 'SMTP Password', isEncrypted: true },
      { key: 'smtp_from_name', value: 'Tailored Timeshare Solutions', description: 'From Name for emails' },
      { key: 'smtp_from_email', value: 'sales@tailoredtimeshare.com', description: 'From Email Address' },
    ];

    smtpSettings.forEach(setting => {
      if (!settings.find(s => s.key === setting.key)) {
        createSettingMutation.mutate({
          ...setting,
          category: 'smtp',
          isEncrypted: setting.isEncrypted || false
        });
      }
    });

    toast({ title: "SMTP settings initialized", description: "Please configure the values" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading admin settings...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Site Settings
            </h1>
            <p className="text-gray-600 mt-2">Configure system settings and SMTP email configuration</p>
          </div>

          <Tabs defaultValue="smtp" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="smtp" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                SMTP
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                All Settings
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smtp" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      SMTP Email Configuration
                    </span>
                    <div className="flex items-center gap-2">
                      <Button onClick={setupSMTPSettings} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Initialize SMTP Settings
                      </Button>
                      {hasUnsavedChanges && (
                        <Badge variant="secondary" className="text-orange-600">
                          Unsaved Changes
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categorizedSettings.smtp && categorizedSettings.smtp.length > 0 ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {categorizedSettings.smtp.map((setting) => (
                          <div key={setting.key} className="grid grid-cols-2 gap-4 items-center">
                            <div>
                              <Label className="font-medium">{setting.key.replace('smtp_', '').replace('_', ' ').toUpperCase()}</Label>
                              {setting.description && (
                                <p className="text-sm text-gray-500">{setting.description}</p>
                              )}
                            </div>
                            <div className="relative">
                              <Input
                                type={setting.isEncrypted && !showPasswords.has(setting.key) ? "password" : "text"}
                                value={smtpForm[setting.key] || ''}
                                onChange={(e) => handleSmtpFormChange(setting.key, e.target.value)}
                                className="pr-10"
                                placeholder={`Enter ${setting.key.replace('smtp_', '').replace('_', ' ')}`}
                                data-testid={`input-setting-${setting.key}`}
                              />
                              {setting.isEncrypted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => togglePasswordVisibility(setting.key)}
                                  data-testid={`button-toggle-${setting.key}`}
                                >
                                  {showPasswords.has(setting.key) ? 
                                    <EyeOff className="h-4 w-4" /> : 
                                    <Eye className="h-4 w-4" />
                                  }
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button 
                          onClick={handleSaveSmtpSettings}
                          disabled={!hasUnsavedChanges}
                          className={hasUnsavedChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
                          data-testid="button-save-smtp"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save SMTP Settings
                        </Button>
                        
                        <Button 
                          onClick={handleTestSmtpConnection}
                          variant="outline"
                          disabled={hasUnsavedChanges || testingSmtp}
                          data-testid="button-test-smtp"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          {testingSmtp ? 'Testing...' : 'Test Connection'}
                        </Button>

                        {hasUnsavedChanges && (
                          <div className="flex items-center text-orange-600 text-sm font-medium">
                            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            You have unsaved changes
                          </div>
                        )}

                        {!hasUnsavedChanges && !testingSmtp && settings.some(s => s.category === 'smtp') && (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Settings saved
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Configuration Help:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• <strong>Gmail:</strong> smtp.gmail.com, Port: 587, Use App Password</li>
                          <li>• <strong>Outlook:</strong> smtp.live.com, Port: 587</li>
                          <li>• <strong>Yahoo:</strong> smtp.mail.yahoo.com, Port: 587</li>
                          <li>• Make sure to enable "Less secure apps" or use App Passwords for Gmail</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No SMTP settings configured yet</p>
                      <p className="text-sm">Click "Initialize SMTP Settings" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorizedSettings.general?.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">{setting.key}</Label>
                            {setting.description && (
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {setting.isEncrypted && <Badge variant="secondary">Encrypted</Badge>}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSettingMutation.mutate(setting.key)}
                              data-testid={`button-delete-${setting.key}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={setting.value}
                            onChange={(e) => handleUpdateSetting(setting, { value: e.target.value })}
                            className="min-h-20"
                            data-testid={`textarea-setting-${setting.key}`}
                          />
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No general settings configured yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    All Settings ({settings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(categorizedSettings).map(([category, categorySettings]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
                          {category === 'smtp' && <Mail className="h-4 w-4" />}
                          {category === 'general' && <Globe className="h-4 w-4" />}
                          {category} ({categorySettings.length})
                        </h3>
                        <div className="space-y-3">
                          {categorySettings.map((setting) => (
                            <div key={setting.key} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{setting.key}</code>
                                  {setting.isEncrypted && <Badge variant="secondary">Encrypted</Badge>}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteSettingMutation.mutate(setting.key)}
                                  data-testid={`button-delete-${setting.key}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {setting.description && (
                                <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                              )}
                              <div className="relative">
                                <Input
                                  type={setting.isEncrypted && !showPasswords.has(setting.key) ? "password" : "text"}
                                  value={setting.category === 'smtp' ? (smtpForm[setting.key] || '') : setting.value}
                                  onChange={(e) => {
                                    if (setting.category === 'smtp') {
                                      handleSmtpFormChange(setting.key, e.target.value);
                                    } else {
                                      handleUpdateSetting(setting, { value: e.target.value });
                                    }
                                  }}
                                  className="pr-10"
                                  data-testid={`input-setting-${setting.key}`}
                                />
                                {setting.isEncrypted && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => togglePasswordVisibility(setting.key)}
                                    data-testid={`button-toggle-${setting.key}`}
                                  >
                                    {showPasswords.has(setting.key) ? 
                                      <EyeOff className="h-4 w-4" /> : 
                                      <Eye className="h-4 w-4" />
                                    }
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {category !== Object.keys(categorizedSettings)[Object.keys(categorizedSettings).length - 1] && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Setting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSetting} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="key">Setting Key *</Label>
                        <Input
                          id="key"
                          value={newSetting.key}
                          onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                          placeholder="e.g., site_title"
                          required
                          data-testid="input-new-key"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newSetting.category}
                          onChange={(e) => setNewSetting(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., general, smtp"
                          data-testid="input-new-category"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Value *</Label>
                      <Textarea
                        id="value"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Setting value"
                        required
                        data-testid="textarea-new-value"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newSetting.description}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description"
                        data-testid="input-new-description"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="encrypted"
                        checked={newSetting.isEncrypted}
                        onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, isEncrypted: checked }))}
                        data-testid="switch-new-encrypted"
                      />
                      <Label htmlFor="encrypted">Encrypt this setting (for passwords and sensitive data)</Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createSettingMutation.isPending}
                      data-testid="button-create-setting"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createSettingMutation.isPending ? 'Creating...' : 'Create Setting'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}