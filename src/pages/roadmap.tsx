import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, Lock, PlayCircle, Clock, Award, ChevronDown, ChevronRight, Target, BookOpen, BarChart3, Calendar, Settings, LogOut, Brain, Menu, Home, Map, Users, Trophy, Star } from 'lucide-react';
import { useRouter } from 'next/router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

interface SubModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  locked: boolean;
  score?: number;
  requiredSubtasks?: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

interface Module {
  id: string;
  title: string;
  description: string;
  totalSubModules: number;
  completedSubModules: number;
  subModules: SubModule[];
  locked: boolean;
}

interface Domain {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  modules: Module[];
}

const domains: Domain[] = [
  {
    id: 'dsa-cpp',
    name: 'C++ & Data Structures',
    description: 'Master algorithms and data structures with C++',
    color: 'blue',
    icon: '🧩',
    modules: []
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend and backend web technologies',
    color: 'green',
    icon: '🌐',
    modules: []
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    description: 'iOS and Android app development',
    color: 'purple',
    icon: '📱',
    modules: []
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Scalable system architecture and design patterns',
    color: 'orange',
    icon: '🏗️',
    modules: []
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, containerization, and cloud infrastructure',
    color: 'red',
    icon: '⚙️',
    modules: []
  }
];

// Axolotl Mascot Component
const AxolotlMascot = ({ message, expression = 'happy' }: { message: string; expression?: 'happy' | 'thinking' | 'excited' | 'completed' }) => {
  const expressions = {
    happy: '😊',
    thinking: '🤔',
    excited: '🎉',
    completed: '🏆'
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          🦾
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
          <span className="text-sm">{expressions[expression]}</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

const RoadmapPage = () => {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubModules, setOpenSubModules] = useState<Record<string, boolean>>({});

  const toggleSubModule = (subModuleId: string) => {
    setOpenSubModules(prev => ({
      ...prev,
      [subModuleId]: !prev[subModuleId]
    }));
  };

  useEffect(() => {
    // Load roadmap data
    setModules([
      {
        id: 'arrays',
        title: 'Arrays Mastery',
        description: 'Master array operations, algorithms, and data manipulation',
        totalSubModules: 6,
        completedSubModules: 0,
        locked: false,
        subModules: [
          {
            id: 'array-basics',
            title: 'Array Fundamentals',
            description: 'Understanding array structure, memory allocation, and basic concepts',
            duration: '45 min',
            difficulty: 'Easy',
            completed: false,
            locked: false,
            requiredSubtasks: [
              {
                id: 'st_basics_1',
                title: 'Memory Layout Concepts',
                description: 'Learn how arrays are stored in memory',
                completed: false
              },
              {
                id: 'st_basics_2',
                title: 'Index vs Pointer Understanding',
                description: 'Understand the relationship between array indexing and pointers',
                completed: false
              }
            ]
          },
          {
            id: 'array-traversal',
            title: 'Array Traversal',
            description: 'Different ways to iterate through arrays and access elements',
            duration: '30 min',
            difficulty: 'Easy',
            completed: false,
            locked: false,
            requiredSubtasks: [
              {
                id: 'st_traversal_1',
                title: 'Loop Optimization Practice',
                description: 'Practice different loop patterns for array traversal',
                completed: false
              },
              {
                id: 'st_traversal_2',
                title: 'Iterator vs Index Comparison',
                description: 'Compare different traversal methods and their efficiency',
                completed: false
              }
            ]
          },
          {
            id: 'array-insertion',
            title: 'Array Insertion Operations',
            description: 'Insert elements at different positions in arrays',
            duration: '40 min',
            difficulty: 'Medium',
            completed: false,
            locked: true
          },
          {
            id: 'array-deletion',
            title: 'Array Deletion Operations',
            description: 'Remove elements from arrays efficiently',
            duration: '35 min',
            difficulty: 'Medium',
            completed: false,
            locked: true
          },
          {
            id: 'array-searching',
            title: 'Array Searching Algorithms',
            description: 'Linear search, binary search, and optimization techniques',
            duration: '50 min',
            difficulty: 'Medium',
            completed: false,
            locked: true
          },
          {
            id: 'array-sorting',
            title: 'Array Sorting Algorithms',
            description: 'Bubble sort, selection sort, insertion sort implementation',
            duration: '60 min',
            difficulty: 'Hard',
            completed: false,
            locked: true
          }
        ]
      },
      {
        id: 'linked-lists',
        title: 'Linked Lists',
        description: 'Dynamic data structures and pointer manipulation',
        totalSubModules: 5,
        completedSubModules: 0,
        locked: true,
        subModules: []
      },
      {
        id: 'stacks-queues',
        title: 'Stacks & Queues',
        description: 'LIFO and FIFO data structures with real-world applications',
        totalSubModules: 4,
        completedSubModules: 0,
        locked: true,
        subModules: []
      }
    ]);
    setLoading(false);
  }, []);

  const handleStartModule = (moduleId: string, subModuleId: string) => {
    router.push(`/test?module=${moduleId}&submodule=${subModuleId}`);
  };

  const handleStartSubtask = (subtaskId: string, moduleId: string, subModuleId: string) => {
    router.push(`/subtask?id=${subtaskId}&module=${moduleId}&submodule=${subModuleId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DSA Learning Roadmap</h1>
              <p className="text-gray-600 mt-2">Master Data Structures & Algorithms in C++</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">15</div>
                <div className="text-sm text-gray-500">Total Modules</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {modules.map((module) => (
            <Card key={module.id} className="bg-white shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {module.title}
                      </CardTitle>
                      {module.locked && <Lock className="h-5 w-5 text-gray-400" />}
                      {module.completedSubModules === module.totalSubModules && (
                        <Award className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardDescription className="mt-2 text-gray-600">
                      {module.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {module.completedSubModules}/{module.totalSubModules} completed
                    </div>
                    <Progress 
                      value={(module.completedSubModules / module.totalSubModules) * 100} 
                      className="w-24 mt-2"
                    />
                  </div>
                </div>
              </CardHeader>

              {!module.locked && module.subModules.length > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    {module.subModules.map((subModule) => (
                      <Card 
                        key={subModule.id} 
                        className={`transition-all duration-200 ${
                          subModule.locked ? 'opacity-60' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                              {subModule.title}
                            </h4>
                            <div className="ml-2 flex-shrink-0">
                              {subModule.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : subModule.locked ? (
                                <Lock className="h-5 w-5 text-gray-400" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {subModule.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(subModule.difficulty)}`}
                            >
                              {subModule.difficulty}
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {subModule.duration}
                            </div>
                          </div>

                          {/* Subtasks Dropdown */}
                          {subModule.requiredSubtasks && subModule.requiredSubtasks.length > 0 && (
                            <Collapsible 
                              open={openSubModules[subModule.id]} 
                              onOpenChange={() => toggleSubModule(subModule.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-between p-2 h-auto text-xs mb-2 hover:bg-orange-50"
                                >
                                  <div className="flex items-center">
                                    <Target className="h-3 w-3 mr-1 text-orange-500" />
                                    <span className="text-orange-600 font-medium">
                                      {subModule.requiredSubtasks.filter(st => !st.completed).length} Subtasks Required
                                    </span>
                                  </div>
                                  {openSubModules[subModule.id] ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2">
                                {subModule.requiredSubtasks.map((subtask) => (
                                  <div 
                                    key={subtask.id} 
                                    className="flex items-start p-2 bg-orange-50 rounded border border-orange-100"
                                  >
                                    <CheckCircle2 
                                      className={`h-3 w-3 mr-2 mt-0.5 flex-shrink-0 ${
                                        subtask.completed ? 'text-green-500' : 'text-gray-300'
                                      }`} 
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium ${
                                        subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                      }`}>
                                        {subtask.title}
                                      </p>
                                      <p className={`text-xs ${
                                        subtask.completed ? 'line-through text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {subtask.description}
                                      </p>
                                    </div>
                                    {!subtask.completed && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="ml-2 h-6 px-2 text-xs"
                                        onClick={() => handleStartSubtask(subtask.id, module.id, subModule.id)}
                                      >
                                        Start
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          <Button
                            size="sm"
                            className="w-full"
                            disabled={subModule.locked}
                            onClick={() => handleStartModule(module.id, subModule.id)}
                            variant={subModule.completed ? "outline" : "default"}
                          >
                            {subModule.completed ? (
                              <>
                                <Award className="h-3 w-3 mr-1" />
                                Review (Score: {subModule.score}%)
                              </>
                            ) : subModule.locked ? (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-3 w-3 mr-1" />
                                Start Module
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
