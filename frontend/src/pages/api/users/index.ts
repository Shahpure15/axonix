import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface UserData {
  id: string;
  email: string;
  password: string;
  name: string;
  onboardingCompleted: boolean;
  onboarding_status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  lastLogin?: string;
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
    // Register new user
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const database = readDatabase();

      // Check if user already exists
      const existingUser = database.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }

      // Create new user
      const newUser: UserData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        password, // In real app, hash this with bcrypt
        name,
        onboardingCompleted: false,
        onboarding_status: 'not_started',
        createdAt: new Date().toISOString()
      };

      database.users.push(newUser);
      writeDatabase(database);

      // Return user data without password
      const { password: _, ...userResponse } = newUser;
      res.status(201).json({ user: userResponse });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else if (req.method === 'PUT') {
    // Update user onboarding status only
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

      // Update user onboarding status
      const user = database.users[userIndex];
      user.onboardingCompleted = true;
      user.onboarding_status = 'completed';

      writeDatabase(database);

      // Return user data without password
      const { password: _, ...userResponse } = user;
      res.status(200).json({ user: userResponse });

    } catch (error) {
      console.error('Onboarding status update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else if (req.method === 'GET') {
    // Get user by ID
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const database = readDatabase();
      const user = database.users.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userResponse } = user;
      res.status(200).json({ user: userResponse });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
