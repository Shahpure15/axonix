import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

interface OnboardingData {
  userId: string;
  email: string;
  name: string;
  domains: string[];
  experience_level: string;
  preferred_study_time: string;
  timezone: string;
  onboardingCompleted: boolean;
  completedAt: string;
  createdAt: string;
}

interface OnboardingDatabase {
  onboarding_data: OnboardingData[];
}

const onboardingPath = path.join(process.cwd(), 'data', 'onboarding.json');

const readOnboardingDatabase = (): OnboardingDatabase => {
  try {
    const fileContent = fs.readFileSync(onboardingPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading onboarding database:', error);
    return { onboarding_data: [] };
  }
};

const writeOnboardingDatabase = (database: OnboardingDatabase): void => {
  try {
    fs.writeFileSync(onboardingPath, JSON.stringify(database, null, 2));
    console.log('✅ Onboarding database written successfully');
  } catch (error) {
    console.error('Error writing onboarding database:', error);
    throw error;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Save onboarding data
    try {
      const { userId, email, name, domains, experience_level, preferred_study_time, timezone } = req.body;

      if (!userId || !email || !domains || !experience_level || !preferred_study_time || !timezone) {
        return res.status(400).json({ error: 'All onboarding fields are required' });
      }

      const database = readOnboardingDatabase();

      // Check if user already has onboarding data
      const existingIndex = database.onboarding_data.findIndex(data => data.userId === userId);

      const onboardingData: OnboardingData = {
        userId,
        email,
        name,
        domains,
        experience_level,
        preferred_study_time,
        timezone,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
        createdAt: existingIndex !== -1 ? database.onboarding_data[existingIndex].createdAt : new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        // Update existing data
        database.onboarding_data[existingIndex] = onboardingData;
        console.log(`📝 Updated onboarding data for user: ${userId}`);
      } else {
        // Add new data
        database.onboarding_data.push(onboardingData);
        console.log(`📝 Added new onboarding data for user: ${userId}`);
      }

      writeOnboardingDatabase(database);

      res.status(200).json({ 
        success: true, 
        message: 'Onboarding data saved successfully',
        data: onboardingData 
      });

    } catch (error) {
      console.error('Onboarding save error:', error);
      res.status(500).json({ error: 'Failed to save onboarding data' });
    }

  } else if (req.method === 'GET') {
    // Get onboarding data for a user
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const database = readOnboardingDatabase();
      const onboardingData = database.onboarding_data.find(data => data.userId === userId);

      if (!onboardingData) {
        return res.status(404).json({ error: 'Onboarding data not found' });
      }

      res.status(200).json({ data: onboardingData });

    } catch (error) {
      console.error('Get onboarding data error:', error);
      res.status(500).json({ error: 'Failed to get onboarding data' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
