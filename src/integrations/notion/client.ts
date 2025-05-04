import { Client } from '@notionhq/client';

// Singleton pattern for Notion client
let notionClient: Client | null = null;

export const initNotionClient = (apiKey: string): Client => {
  if (!apiKey) {
    throw new Error('Notion API key is required');
  }
  
  notionClient = new Client({
    auth: apiKey,
  });
  
  return notionClient;
};

export const getNotionClient = (): Client => {
  if (!notionClient) {
    throw new Error('Notion client not initialized. Call initNotionClient first.');
  }
  
  return notionClient;
};

export const isNotionClientInitialized = (): boolean => {
  return notionClient !== null;
};

export const searchNotionDatabases = async (): Promise<any[]> => {
  if (!notionClient) {
    throw new Error('Notion client not initialized');
  }
  
  try {
    const response = await notionClient.search({
      filter: {
        value: 'database',
        property: 'object'
      }
    });
    
    return response.results;
  } catch (error) {
    console.error('Error searching Notion databases:', error);
    throw error;
  }
};

export const queryNotionDatabase = async (databaseId: string, filter?: any): Promise<any[]> => {
  if (!notionClient) {
    throw new Error('Notion client not initialized');
  }
  
  try {
    const queryParams: any = {
      database_id: databaseId,
    };
    
    if (filter) {
      queryParams.filter = filter;
    }
    
    const response = await notionClient.databases.query(queryParams);
    return response.results;
  } catch (error) {
    console.error(`Error querying Notion database ${databaseId}:`, error);
    throw error;
  }
};

export const getNotionDatabaseSchema = async (databaseId: string): Promise<any> => {
  if (!notionClient) {
    throw new Error('Notion client not initialized');
  }
  
  try {
    const response = await notionClient.databases.retrieve({
      database_id: databaseId,
    });
    
    return response.properties;
  } catch (error) {
    console.error(`Error getting Notion database schema ${databaseId}:`, error);
    throw error;
  }
}; 