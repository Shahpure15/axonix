import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';
import { sendDiagnosticEvent, getTemplatedRoadmap } from '@/lib/qraptor';

interface UserData {
  id: string;
  name: string;
  domains: string[];
  experience_level: string;
  preferred_study_time: string;
  timezone: string;
  diagnosticTests: Record<string, { completed: boolean; score?: number; }>;
  learningPath?: {
    modules: Array<{
      moduleId: string;
      title: string;
      description: string;
      estimatedHours: number;
      completed?: boolean;
      score?: number;
    }>;
  };
}

interface Database {
  users: UserData[];
}

const databasePath = path.join(process.cwd(), 'data', 'users.json');

const readDatabase = (): Database => {
  try {
    const fileContent = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [] };
  }
};

const writeDatabase = (database: Database): void => {
  try {
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    // Update diagnostic test status
    try {
      const { userId, domainId, completed, score } = req.body;

      if (!userId || !domainId || completed === undefined) {
        return res.status(400).json({ error: 'User ID, domain ID, and completed status are required' });
      }

      const database = readDatabase();
      const userIndex = database.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update diagnostic test status
      const user = database.users[userIndex];
      
      if (!user.diagnosticTests[domainId]) {
        user.diagnosticTests[domainId] = { completed: false };
      }
      
      user.diagnosticTests[domainId].completed = completed;
      if (score !== undefined) {
        user.diagnosticTests[domainId].score = score;

        // Send event to Qraptor
        await sendDiagnosticEvent({
          userId,
          domainId,
          score
        });

        // Generate templated roadmap
        const roadmap = getTemplatedRoadmap(domainId);
        user.learningPath = {
          modules: roadmap
        };
      }

      writeDatabase(database);

      // Return user data with roadmap
      const response = {
        user,
        roadmap: user.learningPath?.modules || []
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Diagnostic test update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
