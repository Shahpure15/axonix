import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userStorage, getDomainById } from '@/lib/userData';

export default function DiagnosticTest() {
  const router = useRouter();
  const { domain } = router.query;
  const [domainInfo, setDomainInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (domain && typeof domain === 'string') {
        const domainData = getDomainById(domain);
        setDomainInfo(domainData);

        // Get current user
        const user = await userStorage.getCurrentUser();
        setCurrentUser(user);
      }
      setIsLoading(false);
    };

    loadData();
  }, [domain]);

  const handleStartTest = () => {
    // For now, just redirect to a placeholder
    // Later this will open the actual test interface
    router.push(`/diagnostic-test/${domain}/start`);
  };

  const handleCompleteTest = async () => {
    if (!currentUser || !domain || typeof domain !== 'string') {
      alert('Error: Missing user or domain information');
      return;
    }

    try {
      console.log(`🎯 Completing diagnostic test for domain: ${domain}`);
      
      // Save diagnostic test completion EXACTLY like signup saves data
      await userStorage.saveDiagnosticTest(
        currentUser.id,
        currentUser.email,
        domain,
        domainInfo?.name || domain,
        true, // completed
        85 // score
      );
      
      console.log(`✅ Diagnostic test SAVED to diagnostic_tests.json - SAME TO SAME like signup!`);
      alert(`Diagnostic test for ${domainInfo?.name} completed! Score: 85%\nData saved to diagnostic_tests.json - SAME TO SAME like signup!`);
      
      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete diagnostic test:', error);
      alert(`Failed to save test results: ${error.message}`);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!domainInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Domain Not Found</h2>
            <p className="text-gray-600 mb-4">The selected domain could not be found.</p>
            <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Diagnostic Test
          </CardTitle>
          <CardDescription className="text-lg">
            {domainInfo.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">About this test</h3>
              <p className="text-blue-700">
                {domainInfo.description}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions</h3>
              <div className="text-yellow-700 text-left space-y-2">
                <p>• This diagnostic test will assess your current knowledge in {domainInfo.name}</p>
                <p>• The test contains 10-15 questions of varying difficulty</p>
                <p>• There is no time limit, take your time to think</p>
                <p>• Your results will help customize your learning path</p>
              </div>
            </div>

            {currentUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Welcome back!</h3>
                <p className="text-green-700">
                  Ready to start your learning journey in {domainInfo.name}?
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="px-6"
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/roadmap')}
              className="px-6"
            >
              View Roadmap
            </Button>
            <Button 
              onClick={handleStartTest}
              variant="outline"
              className="px-6"
            >
              Start Diagnostic Test
            </Button>
            <Button 
              onClick={handleCompleteTest}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              Complete Test (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
