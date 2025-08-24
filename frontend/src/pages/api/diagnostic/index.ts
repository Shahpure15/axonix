import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticTestData {
  userId: string;
  email: string;
  domainId: string;
  domainName: string;
  completed: boolean;
  score?: number;
  startedAt: string;
  completedAt?: string;
}

interface DiagnosticTestDatabase {
  diagnostic_tests: DiagnosticTestData[];
}

const diagnosticPath = path.join(process.cwd(), 'data', 'diagnostic_tests.json');

const readDiagnosticDatabase = (): DiagnosticTestDatabase => {
  try {
    const fileContent = fs.readFileSync(diagnosticPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading diagnostic database:', error);
    return { diagnostic_tests: [] };
  }
};

const writeDiagnosticDatabase = (database: DiagnosticTestDatabase): void => {
  try {
    fs.writeFileSync(diagnosticPath, JSON.stringify(database, null, 2));
    console.log('✅ Diagnostic test database written successfully');
  } catch (error) {
    console.error('Error writing diagnostic database:', error);
    throw error;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Start or complete a diagnostic test
    try {
      const { userId, email, domainId, domainName, completed, score } = req.body;

      if (!userId || !email || !domainId || !domainName || completed === undefined) {
        return res.status(400).json({ error: 'Required fields: userId, email, domainId, domainName, completed' });
      }

      const database = readDiagnosticDatabase();

      // Check if test already exists
      const existingIndex = database.diagnostic_tests.findIndex(
        test => test.userId === userId && test.domainId === domainId
      );

      if (existingIndex !== -1) {
        // Update existing test
        const existingTest = database.diagnostic_tests[existingIndex];
        existingTest.completed = completed;
        if (score !== undefined) existingTest.score = score;
        if (completed) existingTest.completedAt = new Date().toISOString();

        console.log(`📝 Updated diagnostic test: ${userId} - ${domainId} - Completed: ${completed}`);
      } else {
        // Create new test entry
        const testData: DiagnosticTestData = {
          userId,
          email,
          domainId,
          domainName,
          completed,
          score: score || undefined,
          startedAt: new Date().toISOString(),
          completedAt: completed ? new Date().toISOString() : undefined,
        };

        database.diagnostic_tests.push(testData);
        console.log(`📝 Added new diagnostic test: ${userId} - ${domainId} - Completed: ${completed}`);
      }

      writeDiagnosticDatabase(database);

      res.status(200).json({ 
        success: true, 
        message: 'Diagnostic test data saved successfully' 
      });

    } catch (error) {
      console.error('Diagnostic test save error:', error);
      res.status(500).json({ error: 'Failed to save diagnostic test data' });
    }

  } else if (req.method === 'GET') {
    // Get diagnostic test data for a user
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const database = readDiagnosticDatabase();
      const userTests = database.diagnostic_tests.filter(test => test.userId === userId);

      res.status(200).json({ data: userTests });

    } catch (error) {
      console.error('Get diagnostic test data error:', error);
      res.status(500).json({ error: 'Failed to get diagnostic test data' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
