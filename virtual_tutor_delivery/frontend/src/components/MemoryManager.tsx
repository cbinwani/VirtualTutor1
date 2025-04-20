import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemoryManager.css';

interface MemoryRecord {
  key: string;
  value: string;
  type: 'short_term' | 'long_term';
  category: string;
  importance: number;
  accessCount: number;
  lastAccessed: Date;
}

interface MemoryManagerProps {
  userId: string;
  courseId?: string;
  onMemoryUpdate?: (memories: MemoryRecord[]) => void;
}

const MemoryManager: React.FC<MemoryManagerProps> = ({
  userId,
  courseId,
  onMemoryUpdate
}) => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch memories on component mount
  useEffect(() => {
    fetchMemories();
  }, [userId, courseId]);

  // Fetch memories from API
  const fetchMemories = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let url = '/api/memory';
      const params: any = {};
      
      if (courseId) {
        params.category = `course_${courseId}`;
      }
      
      const response = await axios.get(url, { params });
      setMemories(response.data.data);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(response.data.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching memories:', error);
      setError('Failed to load memory records');
      setLoading(false);
    }
  };

  // Store a new memory or update existing one
  const storeMemory = async (
    key: string,
    value: string,
    type: 'short_term' | 'long_term' = 'short_term',
    category: string = 'general',
    importance: number = 1
  ) => {
    try {
      const payload = {
        key,
        value,
        type,
        category,
        importance,
        context: courseId ? { courseId } : undefined
      };
      
      const response = await axios.post('/api/memory', payload);
      
      // Update local state
      const updatedMemories = [...memories];
      const existingIndex = updatedMemories.findIndex(m => m.key === key);
      
      if (existingIndex >= 0) {
        updatedMemories[existingIndex] = response.data.data;
      } else {
        updatedMemories.push(response.data.data);
      }
      
      setMemories(updatedMemories);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(updatedMemories);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error storing memory:', error);
      setError('Failed to store memory');
      throw error;
    }
  };

  // Retrieve a specific memory by key
  const retrieveMemory = async (key: string) => {
    try {
      const response = await axios.get(`/api/memory/key/${key}`);
      
      // Update local state to reflect access count change
      const updatedMemories = memories.map(memory => 
        memory.key === key ? response.data.data : memory
      );
      
      setMemories(updatedMemories);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(updatedMemories);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error retrieving memory:', error);
      return null;
    }
  };

  // Get memories by category
  const getMemoriesByCategory = (category: string) => {
    return memories.filter(memory => memory.category === category);
  };

  // Get memories by type
  const getMemoriesByType = (type: 'short_term' | 'long_term') => {
    return memories.filter(memory => memory.type === type);
  };

  // Get most important memories
  const getImportantMemories = (limit: number = 5) => {
    return [...memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  };

  // Get recently accessed memories
  const getRecentMemories = (limit: number = 5) => {
    return [...memories]
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, limit);
  };

  return {
    memories,
    loading,
    error,
    storeMemory,
    retrieveMemory,
    getMemoriesByCategory,
    getMemoriesByType,
    getImportantMemories,
    getRecentMemories,
    refreshMemories: fetchMemories
  };
};

export default MemoryManager;
