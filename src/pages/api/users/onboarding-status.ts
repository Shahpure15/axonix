import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

interface UserData {
  id: string;
  email: string;
  password: string;
  name: string;
  domains: string[];
  experience_level: string;
  preferred_study_time: string;
  timezone: string;
  onboardingCompleted: boolean;
  onboarding_status: string;
  createdAt: string;
  diagnosticTests: Record<string, { completed: boolean; score?: number; }>;
  lastLogin?: string;
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
    console.log('✅ Users database updated successfully');
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    // Update user onboarding status
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const database = readDatabase();
      const userIndex = database.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's onboarding status
      const user = database.users[userIndex];
      user.onboardingCompleted = true;
      user.onboarding_status = 'completed';

      writeDatabase(database);

      console.log(`✅ Updated onboarding status for user: ${userId}`);

      // Return user data without password
      const { password: _, ...userResponse } = user;
      res.status(200).json({ 
        success: true,
        message: 'Onboarding status updated successfully',
        user: userResponse 
      });

    } catch (error) {
      console.error('Update onboarding status error:', error);
      res.status(500).json({ error: 'Failed to update onboarding status' });
    }

  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
