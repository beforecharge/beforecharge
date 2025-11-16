import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SUPPORTED_CURRENCIES, 
  getUserPreferredCurrency, 
  setUserPreferredCurrency,
  getUserCountry,
  getCurrencyForCountry 
} from '@/utils/currencyUtils';
import { Globe, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CurrencySettings: React.FC = () => {
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const [preferredCurrency, country] = await Promise.all([
          getUserPreferredCurrency(),
          getUserCountry()
        ]);
        
        setCurrentCurrency(preferredCurrency);
        setDetectedCountry(country);
      } catch (error) {
        console.error('Error initializing currency settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const handleCurrencyChange = (currency: string) => {
    setUserPreferredCurrency(currency);
    setCurrentCurrency(currency);
    toast.success(`Currency changed to ${SUPPORTED_CURRENCIES[currency].name}`);
  };

  const getRecommendedCurrency = () => {
    if (detectedCountry) {
      return getCurrencyForCountry(detectedCountry);
    }
    return 'USD';
  };

  const recommendedCurrency = getRecommendedCurrency();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Currency Settings
        </CardTitle>
        <CardDescription>
          Choose your preferred currency for displaying subscription costs. 
          {detectedCountry && ` Detected location: ${detectedCountry}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Selection */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Current Currency</p>
              <p className="text-sm text-blue-700">
                {SUPPORTED_CURRENCIES[currentCurrency].name} ({SUPPORTED_CURRENCIES[currentCurrency].symbol})
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Active
            </Badge>
          </div>
        </div>

        {/* Recommended Currency */}
        {recommendedCurrency !== currentCurrency && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">Recommended for your location</p>
                <p className="text-sm text-green-700">
                  {SUPPORTED_CURRENCIES[recommendedCurrency].name} ({SUPPORTED_CURRENCIES[recommendedCurrency].symbol})
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCurrencyChange(recommendedCurrency)}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Use This
              </Button>
            </div>
          </div>
        )}

        {/* All Currencies */}
        <div>
          <h4 className="font-medium mb-3">All Supported Currencies</h4>
          <div className="grid gap-2">
            {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
              <div
                key={code}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentCurrency === code
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleCurrencyChange(code)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{info.symbol}</div>
                  <div>
                    <p className="font-medium">{info.name}</p>
                    <p className="text-sm text-muted-foreground">{code}</p>
                  </div>
                </div>
                {currentCurrency === code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> When auto-fetching subscriptions from Gmail, amounts in foreign currencies 
            will be automatically converted to your preferred currency using current exchange rates. 
            You can always manually edit subscription amounts if needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySettings;