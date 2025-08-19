import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDomainById } from '@/lib/userData';

export default function StartDiagnosticTest() {
  const router = useRouter();
  const { domain } = router.query;
  
  const domainInfo = domain && typeof domain === 'string' ? getDomainById(domain) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Diagnostic Test - {domainInfo?.name}
          </CardTitle>
          <CardDescription>
            Test interface will be available soon
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="font-semibold text-blue-800 mb-4 text-xl">Coming Soon!</h3>
            <p className="text-blue-700 mb-4">
              The diagnostic test interface is currently under development. 
            </p>
            <p className="text-blue-700">
              This will include interactive questions, code challenges, and personalized assessments for {domainInfo?.name}.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="px-6"
            >
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/diagnostic-test?domain=' + domain)}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              Back to Test Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
