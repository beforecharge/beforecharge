import React from 'react';
import { formatCurrencyAmount, convertCurrency } from '@/utils/currencyUtils';

interface CurrencyPreviewProps {
  selectedCurrency: string;
  className?: string;
}

const CurrencyPreview: React.FC<CurrencyPreviewProps> = ({ 
  selectedCurrency, 
  className = '' 
}) => {
  // Sample subscription amounts in different currencies
  const sampleAmounts = [
    { amount: 9.99, currency: 'USD', service: 'Netflix' },
    { amount: 799, currency: 'INR', service: 'Spotify Premium' },
    { amount: 8.99, currency: 'EUR', service: 'Adobe Creative' },
  ];

  return (
    <div className={`p-3 bg-muted border border-gray-200 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium mb-2">Preview: How subscriptions will appear</h4>
      <div className="space-y-1">
        {sampleAmounts.map((sample, index) => {
          const convertedAmount = sample.currency === selectedCurrency 
            ? sample.amount 
            : convertCurrency(sample.amount, sample.currency, selectedCurrency);
          
          return (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{sample.service}</span>
              <span className="font-medium">
                {formatCurrencyAmount(convertedAmount, selectedCurrency)}
                {sample.currency !== selectedCurrency && (
                  <span className="text-gray-500 ml-1">
                    (was {formatCurrencyAmount(sample.amount, sample.currency)})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Foreign currency amounts are automatically converted using current exchange rates.
      </p>
    </div>
  );
};

export default CurrencyPreview;