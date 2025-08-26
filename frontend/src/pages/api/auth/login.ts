import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

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
  onboarding_status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  lastLogin?: string;
  diagnosticTests: {
    [domainId: string]: {
      completed: boolean;
      score?: number;
      completedAt?: string;
    };
  };
}

interface UsersDatabase {
  users: UserData[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

const readDatabase = (): UsersDatabase => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(fileContent);
    }
    return { users: [] };
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [] };
  }
};

const writeDatabase = (data: UsersDatabase): void => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const database = readDatabase();
      const user = database.users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      writeDatabase(database);

      // Return user data without password
      const { password: _, ...userResponse } = user;
      res.status(200).json({ 
        user: userResponse,
        token: `token_${user.id}_${Date.now()}` // Mock token for demo
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
