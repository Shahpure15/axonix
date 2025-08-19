import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen,
  Search,
  Filter,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Star,
  Calendar,
  Brain,
  Target,
  Award,
  TrendingUp,
  Eye,
  Download,
  Bookmark,
  History,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  Archive
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  domain: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  enrolledDate: Date;
  lastAccessed: Date;
  completedDate?: Date;
  rating: number;
  instructor: string;
  thumbnailUrl: string;
  tags: string[];
  learningPath: string[];
}

interface SessionHistory {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionType: 'lesson' | 'practice' | 'test' | 'review';
  topic: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  score?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  concepts: string[];
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'image' | 'link';
  courseId: string;
  courseName: string;
  description: string;
  url: string;
  downloadUrl?: string;
  size?: string;
  duration?: string;
  addedDate: Date;
  isBookmarked: boolean;
}

export default function LibraryPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Mock data
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Advanced Algorithms & Data Structures',
        domain: 'Computer Science',
        description: 'Comprehensive course covering advanced algorithms, complex data structures, and optimization techniques.',
        status: 'in-progress',
        progress: 75,
        totalLessons: 24,
        completedLessons: 18,
        duration: '12 hours',
        difficulty: 'advanced',
        enrolledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        rating: 4.8,
        instructor: 'Dr. Sarah Chen',
        thumbnailUrl: '/courses/algorithms.jpg',
        tags: ['algorithms', 'data-structures', 'optimization'],
        learningPath: ['Basic Algorithms', 'Intermediate DS', 'Advanced Algorithms', 'System Design']
      },
      {
        id: '2',
        title: 'Database Design & SQL Mastery',
        domain: 'Databases',
        description: 'Master database design principles, advanced SQL queries, and database optimization.',
        status: 'completed',
        progress: 100,
        totalLessons: 16,
        completedLessons: 16,
        duration: '8 hours',
        difficulty: 'intermediate',
        enrolledDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        rating: 4.9,
        instructor: 'Prof. Michael Rodriguez',
        thumbnailUrl: '/courses/database.jpg',
        tags: ['sql', 'database', 'normalization'],
        learningPath: ['SQL Basics', 'Database Design', 'Advanced Queries', 'Performance Optimization']
      },
      {
        id: '3',
        title: 'Machine Learning Fundamentals',
        domain: 'AI/ML',
        description: 'Introduction to machine learning concepts, algorithms, and practical implementations.',
        status: 'paused',
        progress: 40,
        totalLessons: 20,
        completedLessons: 8,
        duration: '15 hours',
        difficulty: 'intermediate',
        enrolledDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        rating: 4.7,
        instructor: 'Dr. Emily Watson',
        thumbnailUrl: '/courses/ml.jpg',
        tags: ['machine-learning', 'python', 'statistics'],
        learningPath: ['Math Foundations', 'ML Basics', 'Supervised Learning', 'Unsupervised Learning']
      },
      {
        id: '4',
        title: 'System Design Interview Prep',
        domain: 'System Design',
        description: 'Prepare for system design interviews with real-world examples and best practices.',
        status: 'not-started',
        progress: 0,
        totalLessons: 12,
        completedLessons: 0,
        duration: '6 hours',
        difficulty: 'advanced',
        enrolledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rating: 4.6,
        instructor: 'Alex Johnson',
        thumbnailUrl: '/courses/system-design.jpg',
        tags: ['system-design', 'scalability', 'architecture'],
        learningPath: ['Design Principles', 'Scalability', 'Database Systems', 'Case Studies']
      }
    ];

    const mockSessionHistory: SessionHistory[] = [
      {
        id: '1',
        courseId: '1',
        courseTitle: 'Advanced Algorithms & Data Structures',
        sessionType: 'lesson',
        topic: 'Graph Algorithms - Dijkstra\'s Algorithm',
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        duration: 45,
        concepts: ['Shortest Path', 'Priority Queue', 'Greedy Algorithms']
      },
      {
        id: '2',
        courseId: '1',
        courseTitle: 'Advanced Algorithms & Data Structures',
        sessionType: 'practice',
        topic: 'Dynamic Programming Practice',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        duration: 30,
        score: 85,
        questionsAnswered: 10,
        correctAnswers: 8,
        concepts: ['Dynamic Programming', 'Memoization', 'Optimal Substructure']
      },
      {
        id: '3',
        courseId: '2',
        courseTitle: 'Database Design & SQL Mastery',
        sessionType: 'test',
        topic: 'SQL Joins and Subqueries',
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        duration: 60,
        score: 92,
        questionsAnswered: 15,
        correctAnswers: 14,
        concepts: ['INNER JOIN', 'LEFT JOIN', 'Subqueries', 'Correlated Queries']
      }
    ];

    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'Algorithm Complexity Cheat Sheet',
        type: 'pdf',
        courseId: '1',
        courseName: 'Advanced Algorithms & Data Structures',
        description: 'Quick reference for Big O notation and algorithm complexities',
        url: '/resources/algo-complexity.pdf',
        downloadUrl: '/downloads/algo-complexity.pdf',
        size: '2.5 MB',
        addedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        isBookmarked: true
      },
      {
        id: '2',
        title: 'Graph Traversal Visualization',
        type: 'video',
        courseId: '1',
        courseName: 'Advanced Algorithms & Data Structures',
        description: 'Interactive visualization of BFS and DFS algorithms',
        url: '/resources/graph-traversal.mp4',
        duration: '15:30',
        addedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        isBookmarked: false
      },
      {
        id: '3',
        title: 'SQL Query Performance Guide',
        type: 'pdf',
        courseId: '2',
        courseName: 'Database Design & SQL Mastery',
        description: 'Best practices for writing efficient SQL queries',
        url: '/resources/sql-performance.pdf',
        downloadUrl: '/downloads/sql-performance.pdf',
        size: '1.8 MB',
        addedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isBookmarked: true
      }
    ];

    setCourses(mockCourses);
    setSessionHistory(mockSessionHistory);
    setResources(mockResources);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-600';
      case 'in-progress': return 'from-blue-500 to-cyan-600';
      case 'paused': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return PlayCircle;
      case 'paused': return PauseCircle;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-400 to-emerald-500';
      case 'intermediate': return 'from-yellow-400 to-orange-500';
      case 'advanced': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'image': return ImageIcon;
      default: return FileText;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || course.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => 
      prev.map(r => r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r)
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-axonix-800 axonix-text-shadow">Course Library</h1>
            <p className="text-axonix-600 mt-1">Manage your learning journey and track your progress</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-axonix-600 to-axonix-800 text-white px-4 py-2">
              {courses.filter(c => c.status === 'completed').length}/{courses.length} Completed
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-axonix-500" />
                <Input
                  placeholder="Search courses, instructors, or domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-axonix-400/50 focus:border-axonix-600 bg-white/80"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'in-progress', 'completed', 'paused', 'not-started'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    onClick={() => setSelectedFilter(filter)}
                    className={
                      selectedFilter === filter
                        ? "bg-axonix-700 text-white"
                        : "border-axonix-400/50 text-axonix-700 hover:bg-axonix-200/50"
                    }
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-axonix-200/60 border border-axonix-400/30">
            <TabsTrigger value="courses" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              My Courses
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              Session History
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const StatusIcon = getStatusIcon(course.status);
                return (
                  <Card 
                    key={course.id}
                    className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-axonix-600 to-axonix-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-axonix-800 truncate">{course.title}</h3>
                            <StatusIcon className="h-5 w-5 text-axonix-600 flex-shrink-0" />
                          </div>
                          
                          <p className="text-sm text-axonix-600 mb-3 line-clamp-2">{course.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={`bg-gradient-to-r ${getStatusColor(course.status)} text-white border-0`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1).replace('-', ' ')}
                            </Badge>
                            <Badge className={`bg-gradient-to-r ${getDifficultyColor(course.difficulty)} text-white border-0`}>
                              {course.difficulty}
                            </Badge>
                            <Badge variant="outline" className="border-axonix-400/50 text-axonix-700">
                              {course.domain}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-axonix-600">Progress</span>
                              <span className="font-medium text-axonix-800">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-axonix-500">
                              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                              <span>{course.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium text-axonix-700">{course.rating}</span>
                              <span className="text-xs text-axonix-500">• {course.instructor}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/learn?course=${course.id}`);
                              }}
                              className="bg-gradient-to-r from-axonix-600 to-axonix-700 hover:from-axonix-700 hover:to-axonix-800 text-white"
                            >
                              {course.status === 'not-started' ? 'Start' : 'Continue'}
                            </Button>
                          </div>

                          <div className="flex justify-between text-xs text-axonix-500 mt-2 pt-2 border-t border-axonix-300/50">
                            <span>Enrolled: {course.enrolledDate.toLocaleDateString()}</span>
                            <span>Last accessed: {course.lastAccessed.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCourses.length === 0 && (
              <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-lg">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-axonix-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-axonix-800 mb-2">No courses found</h3>
                  <p className="text-axonix-600">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <History className="h-6 w-6 text-axonix-600" />
                  Learning Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sessionHistory.map((session) => (
                    <div 
                      key={session.id}
                      className="p-4 rounded-lg border border-axonix-300/50 bg-axonix-100/40 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge 
                              className={`${
                                session.sessionType === 'lesson' ? 'bg-blue-600' :
                                session.sessionType === 'practice' ? 'bg-green-600' :
                                session.sessionType === 'test' ? 'bg-red-600' : 'bg-purple-600'
                              } text-white`}
                            >
                              {session.sessionType}
                            </Badge>
                            <span className="text-sm text-axonix-600">{session.courseTitle}</span>
                          </div>
                          
                          <h3 className="font-semibold text-axonix-800 mb-2">{session.topic}</h3>
                          
                          <div className="grid md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium text-axonix-700">Duration</p>
                              <p className="text-sm text-axonix-600">{session.duration} minutes</p>
                            </div>
                            {session.score !== undefined && (
                              <div>
                                <p className="text-sm font-medium text-axonix-700">Score</p>
                                <p className={`text-sm font-semibold ${session.score >= 80 ? 'text-green-600' : session.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {session.score}% ({session.correctAnswers}/{session.questionsAnswered})
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-axonix-700">Date</p>
                              <p className="text-sm text-axonix-600">
                                {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-axonix-700 mb-1">Concepts Covered:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.concepts.map((concept, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-axonix-400/50 text-axonix-700">
                                  {concept}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-axonix-400/50 text-axonix-700"
                          onClick={() => router.push(`/learn?course=${session.courseId}&topic=${encodeURIComponent(session.topic)}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}

                  {sessionHistory.length === 0 && (
                    <div className="text-center py-8">
                      <History className="h-16 w-16 text-axonix-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-axonix-800 mb-2">No session history</h3>
                      <p className="text-axonix-600">Start learning to see your session history here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Archive className="h-6 w-6 text-axonix-600" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {resources.map((resource) => {
                    const ResourceIcon = getResourceIcon(resource.type);
                    return (
                      <div 
                        key={resource.id}
                        className="p-4 rounded-lg border border-axonix-300/50 bg-axonix-100/40 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-axonix-600 to-axonix-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ResourceIcon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-axonix-800">{resource.title}</h3>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleBookmark(resource.id)}
                                  className={`p-1 ${resource.isBookmarked ? 'text-yellow-500' : 'text-axonix-500'}`}
                                >
                                  <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
                                </Button>
                                {resource.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-axonix-400/50 text-axonix-700"
                                    onClick={() => window.open(resource.downloadUrl, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-axonix-600 mb-2">{resource.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-axonix-500">
                              <span>{resource.courseName}</span>
                              {resource.size && <span>{resource.size}</span>}
                              {resource.duration && <span>{resource.duration}</span>}
                              <span>Added: {resource.addedDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {resources.length === 0 && (
                    <div className="text-center py-8">
                      <Archive className="h-16 w-16 text-axonix-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-axonix-800 mb-2">No resources available</h3>
                      <p className="text-axonix-600">Resources will appear here as you progress through your courses</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
