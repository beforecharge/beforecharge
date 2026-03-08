import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, RefreshCw } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { subscriptions, cleanupDuplicates, refreshSubscriptions } = useSubscriptions();

  if (!import.meta.env.DEV) {
    return null;
  }

  const duplicateNames = subscriptions.reduce((acc, sub) => {
    const existing = subscriptions.filter(s => s.name.toLowerCase() === sub.name.toLowerCase());
    if (existing.length > 1 && !acc.includes(sub.name)) {
      acc.push(sub.name);
    }
    return acc;
  }, [] as string[]);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Debug Panel</CardTitle>
        <CardDescription className="text-orange-600">
          Development tools for managing subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User ID:</strong> {user?.id}
          </div>
          <div>
            <strong>Total Subscriptions:</strong> {subscriptions.length}
          </div>
          <div>
            <strong>Duplicates Found:</strong> {duplicateNames.length}
          </div>
          <div>
            <strong>Duplicate Names:</strong> {duplicateNames.join(', ') || 'None'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={cleanupDuplicates}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            disabled={duplicateNames.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clean Up Duplicates
          </Button>
          
          <Button
            onClick={refreshSubscriptions}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;