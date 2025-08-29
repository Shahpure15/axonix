import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Brain, Code, Smartphone, Cloud, Shield, Palette, Gamepad2, Database, Server, Layout } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const availableDomains: Domain[] = [
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    icon: <Brain className="w-5 h-5" />,
    description: 'AI algorithms, neural networks, and predictive modeling'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: <Database className="w-5 h-5" />,
    description: 'Data analysis, statistics, and business intelligence'
  },
  {
    id: 'web-development',
    name: 'Web Development',
    icon: <Code className="w-5 h-5" />,
    description: 'Frontend and backend web technologies'
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'iOS and Android app development'
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: <Server className="w-5 h-5" />,
    description: 'CI/CD, containerization, and infrastructure'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: <Shield className="w-5 h-5" />,
    description: 'Security protocols, ethical hacking, and compliance'
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    icon: <Database className="w-5 h-5" />,
    description: 'Cryptocurrencies, smart contracts, and DeFi'
  },
  {
    id: 'game-development',
    name: 'Game Development',
    icon: <Gamepad2 className="w-5 h-5" />,
    description: 'Game engines, graphics programming, and game design'
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: <Palette className="w-5 h-5" />,
    description: 'User interface design and user experience'
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    icon: <Cloud className="w-5 h-5" />,
    description: 'AWS, Azure, GCP, and cloud architecture'
  }
];

interface DomainManagerProps {
  userDomains: string[];
  onDomainsUpdate: (domains: string[]) => void;
}

export default function DomainManager({ userDomains, onDomainsUpdate }: DomainManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addDomain = async (domainId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/progress/domains`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add',
          domainName: domainId,
          experienceLevel: 'beginner'
        }),
      });

      const result = await response.json();
      if (result.success) {
        const updatedDomains = [...userDomains, domainId];
        onDomainsUpdate(updatedDomains);
        setIsDialogOpen(false);
      } else {
        alert(result.message || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Failed to add domain');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!confirm(`Are you sure you want to remove ${domainId.replace('-', ' ')} from your learning path?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/progress/domains`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'remove',
          domainName: domainId
        }),
      });

      const result = await response.json();
      if (result.success) {
        const updatedDomains = userDomains.filter(d => d !== domainId);
        onDomainsUpdate(updatedDomains);
      } else {
        alert(result.message || 'Failed to remove domain');
      }
    } catch (error) {
      console.error('Error removing domain:', error);
      alert('Failed to remove domain');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDomainInfo = (domainId: string) => {
    return availableDomains.find(d => d.id === domainId);
  };

  const getAvailableToAdd = () => {
    return availableDomains.filter(d => !userDomains.includes(d.id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Learning Domains</CardTitle>
            <CardDescription>
              Manage your learning paths and add new domains
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Learning Domain</DialogTitle>
                <DialogDescription>
                  Choose a new domain to add to your learning path
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {getAvailableToAdd().map((domain) => (
                  <div
                    key={domain.id}
                    className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => addDomain(domain.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-1">
                        {domain.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{domain.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getAvailableToAdd().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  You've added all available domains to your learning path!
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {userDomains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No learning domains selected yet.</p>
            <p className="text-sm mt-1">Add domains to start your learning journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userDomains.map((domainId) => {
              const domainInfo = getUserDomainInfo(domainId);
              if (!domainInfo) return null;

              return (
                <div
                  key={domainId}
                  className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-1">
                        {domainInfo.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{domainInfo.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{domainInfo.description}</p>
                        <Badge variant="outline" className="mt-2">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDomain(domainId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
