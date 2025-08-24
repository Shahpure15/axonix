import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';
import { sendModuleSubmission } from '@/lib/worqhat';

interface UserData {
  id: string;
  name: string;
  domains: string[];
  learningPath?: {
    modules: Array<{
      moduleId: string;
      title: string;
      description: string;
      estimatedHours: number;
      completed?: boolean;
      score?: number;
      subtasks?: Array<{
        id: string;
        title: string;
        description: string;
        type: 'practice' | 'concept' | 'quiz';
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        completed?: boolean;
      }>;
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
  if (req.method === 'POST') {
    try {
      const { userId, moduleId, score, answers } = req.body;

      if (!userId || !moduleId || !answers || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const database = readDatabase();
      const user = database.users.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.learningPath) {
        return res.status(400).json({ error: 'User has no active learning path' });
      }

      // Find the module
      const moduleIndex = user.learningPath.modules.findIndex(m => m.moduleId === moduleId);
      if (moduleIndex === -1) {
        return res.status(404).json({ error: 'Module not found in user\'s learning path' });
      }

      // Send to Worqhat and get recommended subtasks
      const subtasks = await sendModuleSubmission({
        userId,
        moduleId,
        score,
        answers
      });

      // Update module with score and subtasks
      user.learningPath.modules[moduleIndex] = {
        ...user.learningPath.modules[moduleIndex],
        score,
        completed: true,
        subtasks: subtasks.map(task => ({
          ...task,
          completed: false
        }))
      };

      writeDatabase(database);

      res.status(200).json({
        module: user.learningPath.modules[moduleIndex]
      });

    } catch (error) {
      console.error('Module submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
