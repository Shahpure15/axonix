import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Crown, 
  Flame, 
  Users, 
  Trophy, 
  Star,
  Coins,
  Heart,
  Shield,
  Zap,
  Gift,
  Calendar,
  Award,
  Swords,
  UserPlus,
  Settings,
  MapPin,
  Clock,
  Target,
  Sparkles,
  Medal,
  Gem
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: string;
  title: string;
  streakDays: number;
  totalLotls: number;
  joinDate: string;
  mascotPet: {
    name: string;
    type: string;
    level: number;
    rarity: string;
  };
  achievements: Achievement[];
  friends: Friend[];
  stats: UserStats;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: {
    current: number;
    total: number;
  };
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isOnline: boolean;
  lastSeen: string;
}

interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  studyHours: number;
  consecutiveDays: number;
  favoriteSubject: string;
  testsCompleted: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock profile data - in real app, this would come from API
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: user?.email || '1',
      name: user?.name || 'Alex Chen',
      email: user?.email || 'alex.chen@example.com',
      avatar: user?.avatar_url || '',
      level: 42,
      xp: 8750,
      xpToNext: 1250,
      rank: 'Elite Scholar',
      title: 'Dragon Master',
      streakDays: 28,
      totalLotls: 1250,
      joinDate: '2024-01-15',
      mascotPet: {
        name: 'Axon',
        type: 'Dragon',
        level: 15,
        rarity: 'legendary'
      },
      achievements: [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          rarity: 'common',
          unlockedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Maintain a 30-day learning streak',
          icon: '🔥',
          rarity: 'epic',
          unlockedAt: '2024-02-14',
          progress: { current: 28, total: 30 }
        },
        {
          id: '3',
          name: 'Knowledge Seeker',
          description: 'Answer 1000 questions correctly',
          icon: '🧠',
          rarity: 'rare',
          unlockedAt: '2024-03-01'
        },
        {
          id: '4',
          name: 'Dragon Tamer',
          description: 'Unlock a legendary pet',
          icon: '🐲',
          rarity: 'legendary',
          unlockedAt: '2024-03-15'
        }
      ],
      friends: [
        {
          id: '1',
          name: 'Sarah Kim',
          avatar: '',
          level: 38,
          isOnline: true,
          lastSeen: 'now'
        },
        {
          id: '2',
          name: 'Mike Johnson',
          avatar: '',
          level: 41,
          isOnline: false,
          lastSeen: '2 hours ago'
        },
        {
          id: '3',
          name: 'Emma Wilson',
          avatar: '',
          level: 45,
          isOnline: true,
          lastSeen: 'now'
        }
      ],
      stats: {
        totalQuestions: 2847,
        correctAnswers: 2415,
        accuracy: 84.8,
        studyHours: 127.5,
        consecutiveDays: 28,
        favoriteSubject: 'Mathematics',
        testsCompleted: 15
      }
    };

    setTimeout(() => {
      setProfile(mockProfile);
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400/50 shadow-yellow-400/20';
      case 'epic': return 'border-purple-400/50 shadow-purple-400/20';
      case 'rare': return 'border-blue-400/50 shadow-blue-400/20';
      default: return 'border-gray-400/50 shadow-gray-400/20';
    }
  };

  const getPetEmoji = (type: string) => {
    switch (type) {
      case 'Dragon': return '🐲';
      case 'Unicorn': return '🦄';
      case 'Phoenix': return '🔥';
      case 'Wolf': return '🐺';
      default: return '🐾';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-axonix-200/60 rounded-lg"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-axonix-200/60 rounded-lg"></div>
            <div className="h-64 bg-axonix-200/60 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-axonix-600 via-axonix-700 to-axonix-800">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <CardContent className="relative -mt-16 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-axonix-600/50">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-axonix-600 to-axonix-800 text-white text-4xl font-bold">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm px-2 py-1 rounded-full shadow-lg">
                  Lv.{profile.level}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-axonix-800">{profile.name}</h1>
                  <Badge className={`bg-gradient-to-r ${getRarityColor('epic')} text-white border-0`}>
                    {profile.title}
                  </Badge>
                </div>
                <p className="text-axonix-600 mb-3">{profile.rank}</p>
                
                {/* XP Progress */}
                <div className="space-y-2 max-w-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-axonix-700 font-medium">XP Progress to Level {profile.level + 1}</span>
                    <span className="text-axonix-700 font-mono">{profile.xp.toLocaleString()} / {(profile.xp + profile.xpToNext).toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={(profile.xp / (profile.xp + profile.xpToNext)) * 100} 
                      className="h-4 bg-axonix-200/60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {Math.round((profile.xp / (profile.xp + profile.xpToNext)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-axonix-600">
                    {profile.xpToNext.toLocaleString()} XP needed for next level
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-axonix-400/50 text-axonix-700 hover:bg-axonix-200/50">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  Battle Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-axonix-800">{profile.stats.accuracy}%</div>
                    <div className="text-sm text-axonix-600">Accuracy</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                    <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-axonix-800">{profile.stats.totalQuestions.toLocaleString()}</div>
                    <div className="text-sm text-axonix-600">Questions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-axonix-800">{Math.round(profile.stats.studyHours)}</div>
                    <div className="text-sm text-axonix-600">Study Hours</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-axonix-800">{profile.stats.testsCompleted}</div>
                    <div className="text-sm text-axonix-600">Tests</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Medal className="h-6 w-6 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getRarityBorder(achievement.rarity)} bg-axonix-100/60 hover:scale-105 transition-all duration-300`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-1`}>
                        <div className="w-full h-full rounded-full bg-axonix-50/90 flex items-center justify-center text-2xl">
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-axonix-800">{achievement.name}</h4>
                        <p className="text-sm text-axonix-600">{achievement.description}</p>
                        {achievement.progress && (
                          <div className="mt-2">
                            <Progress 
                              value={(achievement.progress.current / achievement.progress.total) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-axonix-600 mt-1">
                              {achievement.progress.current}/{achievement.progress.total}
                            </p>
                          </div>
                        )}
                      </div>
                      <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white border-0`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clan Section */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Clan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h3 className="text-xl font-bold text-axonix-800 mb-2">Epic Clan Wars Coming Soon!</h3>
                  <p className="text-axonix-600 mb-4">
                    Join forces with fellow learners in epic clan battles! Compete in tournaments, 
                    unlock exclusive rewards, and climb the clan leaderboards together.
                  </p>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2">
                    🚀 Stay Tuned for Launch!
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-bold text-axonix-800">{profile.streakDays} Days</div>
                    <div className="text-sm text-axonix-600">Learning Streak</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-bold text-axonix-800">{profile.totalLotls.toLocaleString()}</div>
                    <div className="text-sm text-axonix-600">Lotls</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-bold text-axonix-800">{new Date(profile.joinDate).toLocaleDateString()}</div>
                    <div className="text-sm text-axonix-600">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mascot Pet */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Heart className="h-6 w-6 text-red-600" />
                  Mascot Pet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRarityColor(profile.mascotPet.rarity)} p-1`}>
                    <div className="w-full h-full rounded-full bg-axonix-50/90 flex items-center justify-center text-4xl">
                      {getPetEmoji(profile.mascotPet.type)}
                    </div>
                  </div>
                  <h3 className="font-bold text-axonix-800">{profile.mascotPet.name}</h3>
                  <p className="text-axonix-600 capitalize">{profile.mascotPet.type}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-axonix-700 font-medium">Level {profile.mascotPet.level}</span>
                  </div>
                  <Button 
                    className="mt-4 w-full bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white"
                    onClick={() => router.push('/pet-house')}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Pet House
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Friends */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Users className="h-6 w-6 text-blue-600" />
                  Friends ({profile.friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {profile.friends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback className="bg-gradient-to-br from-axonix-600 to-axonix-800 text-white">
                            {friend.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-axonix-800">{friend.name}</p>
                        <p className="text-xs text-axonix-600">Level {friend.level} • {friend.lastSeen}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-axonix-400/50 text-axonix-700 hover:bg-axonix-200/50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
