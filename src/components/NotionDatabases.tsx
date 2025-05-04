import React, { useState, useEffect } from 'react';
import { 
  searchNotionDatabases, 
  queryNotionDatabase, 
  getNotionDatabaseSchema,
  isNotionClientInitialized
} from '../integrations/notion/client';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Database, RefreshCw, Search } from 'lucide-react';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

interface NotionDatabasesProps {
  onSelect?: (databaseId: string, title: string) => void;
}

const NotionDatabases: React.FC<NotionDatabasesProps> = ({ onSelect }) => {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [databaseItems, setDatabaseItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if Notion client is initialized
    if (!isNotionClientInitialized()) {
      setError('Notion client not initialized. Please add your Notion API key.');
      return;
    }
    
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchNotionDatabases();
      setDatabases(result);
    } catch (error: any) {
      console.error('Error fetching Notion databases:', error);
      setError(error.message || 'Failed to fetch Notion databases');
      toast({
        title: "Error",
        description: `Failed to fetch Notion databases: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = async (databaseId: string, title: string) => {
    setSelectedDatabase(databaseId);
    setLoadingItems(true);
    
    try {
      const items = await queryNotionDatabase(databaseId);
      setDatabaseItems(items);
      
      if (onSelect) {
        onSelect(databaseId, title);
      }
    } catch (error: any) {
      console.error('Error querying database:', error);
      toast({
        title: "Error",
        description: `Failed to query database: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewSchema = async (databaseId: string) => {
    try {
      const schema = await getNotionDatabaseSchema(databaseId);
      console.log('Database schema:', schema);
      
      // Display schema in a formatted way
      const schemaString = JSON.stringify(schema, null, 2);
      alert(`Database Schema:\n${schemaString}`);
    } catch (error: any) {
      console.error('Error getting database schema:', error);
      toast({
        title: "Error",
        description: `Failed to get schema: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Filter databases based on search query
  const filteredDatabases = databases.filter(db => 
    db.title?.some((titleObj: any) => 
      titleObj.plain_text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (error && !loading && databases.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Notion Databases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 mb-4">
            {error}
          </div>
          <Button onClick={fetchDatabases} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Notion Databases
          </div>
          <Button
            onClick={fetchDatabases}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search databases..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDatabases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery 
              ? 'No databases found matching your search' 
              : 'No databases found in your Notion workspace'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDatabases.map(db => {
              const title = db.title
                ?.map((titleObj: any) => titleObj.plain_text)
                .join('') || 'Untitled Database';
                
              return (
                <div 
                  key={db.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDatabase === db.id 
                      ? 'bg-primary/5 border-primary' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => handleDatabaseSelect(db.id, title)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{title}</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSchema(db.id);
                        }}
                      >
                        View Schema
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {db.id}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Database items section (if a database is selected) */}
        {selectedDatabase && databaseItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Database Contents ({databaseItems.length} items)
            </h3>
            {loadingItems ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {databaseItems.map(item => {
                  // Extract the page title (different properties for each database)
                  const pageTitle = item.properties?.Name?.title?.[0]?.plain_text || 
                                   item.properties?.Title?.title?.[0]?.plain_text ||
                                   'Untitled Page';
                  
                  return (
                    <div key={item.id} className="p-3 border rounded-md">
                      <div className="font-medium">{pageTitle}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {item.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionDatabases; 