
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Key, Save, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_KEY_STORAGE_KEY = 'openrouter_api_key';
const MODEL_STORAGE_KEY = 'openrouter_model';

const AVAILABLE_MODELS = [
  { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Recommended)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
  { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' }
];

export const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1');
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    
    if (storedKey) {
      setApiKey(storedKey);
      setHasKey(true);
    }
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Please enter your API key",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      toast({
        title: "Invalid API key format",
        description: "OpenRouter API keys should start with 'sk-or-v1-'",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    setHasKey(true);
    setShowSettings(false);
    toast({
      title: "API key and model saved successfully",
      description: `Using ${AVAILABLE_MODELS.find(m => m.value === selectedModel)?.label}`
    });
  };

  const handleRemoveKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(MODEL_STORAGE_KEY);
    setApiKey('');
    setHasKey(false);
    setShowSettings(false);
    toast({
      title: "API key removed",
      description: "Your API key has been removed from local storage"
    });
  };

  return (
    <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <Key className="h-5 w-5 text-amber-600" />
        <h3 className="font-semibold text-amber-800">OpenRouter AI Configuration</h3>
      </div>
      
      {!hasKey || showSettings ? (
        <div className="space-y-3">
          <p className="text-sm text-amber-700">
            Configure your OpenRouter API key and preferred AI model. 
            Get your free API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a>
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-700">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveKey} className="bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
              {hasKey && (
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-green-700">
            ✅ API configured - Model: {AVAILABLE_MODELS.find(m => m.value === selectedModel)?.label}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveKey}>
              Remove Key
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const getStoredModel = (): string => {
  return localStorage.getItem(MODEL_STORAGE_KEY) || 'deepseek/deepseek-r1';
};
