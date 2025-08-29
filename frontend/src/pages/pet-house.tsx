import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Gem, 
  Lock, 
  ShoppingBag, 
  Star, 
  Heart,
  Sparkles,
  Gift,
  Coins,
  Users,
  Shield,
  Zap,
  Trophy,
  PawPrint,
  HomeIcon
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  isMascot: boolean;
  level: number;
  happiness: number;
  accessories: Accessory[];
  image: string;
}

interface Accessory {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'collar' | 'outfit' | 'background';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isEquipped: boolean;
  image: string;
}

export default function PetHousePage() {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [userLotls, setUserLotls] = useState(1250);

  // Mock data for pets
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Axon',
      type: 'Dragon',
      rarity: 'legendary',
      isOwned: true,
      isMascot: true,
      level: 15,
      happiness: 95,
      accessories: [
        { id: 'crown1', name: 'Golden Crown', type: 'hat', rarity: 'epic', isEquipped: true, image: '/accessories/crown.png' },
        { id: 'collar1', name: 'Lightning Collar', type: 'collar', rarity: 'rare', isEquipped: true, image: '/accessories/collar.png' }
      ],
      image: '/pets/dragon.png'
    },
    {
      id: '2',
      name: 'Sparkle',
      type: 'Unicorn',
      rarity: 'epic',
      isOwned: true,
      isMascot: false,
      level: 8,
      happiness: 88,
      accessories: [
        { id: 'horn1', name: 'Rainbow Horn', type: 'hat', rarity: 'rare', isEquipped: true, image: '/accessories/horn.png' }
      ],
      image: '/pets/unicorn.png'
    },
    {
      id: '3',
      name: 'Phoenix',
      type: 'Phoenix',
      rarity: 'legendary',
      isOwned: false,
      isMascot: false,
      level: 0,
      happiness: 0,
      accessories: [],
      image: '/pets/phoenix.png'
    },
    {
      id: '4',
      name: 'Buddy',
      type: 'Wolf',
      rarity: 'rare',
      isOwned: false,
      isMascot: false,
      level: 0,
      happiness: 0,
      accessories: [],
      image: '/pets/wolf.png'
    }
  ]);

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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hat': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'glasses': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'collar': return <Gem className="h-4 w-4 text-purple-600" />;
      case 'outfit': return <Sparkles className="h-4 w-4 text-pink-600" />;
      case 'background': return <HomeIcon className="h-4 w-4 text-green-600" />;
      default: return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPetEmoji = (type: string) => {
    switch (type) {
      case 'Dragon': return '🐲';
      case 'Unicorn': return '🦄';
      case 'Phoenix': return '🔥';
      case 'Wolf': return '🐺';
      case 'Fox': return '🦊';
      case 'Cat': return '🐱';
      default: return '🐾';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-axonix-800 axonix-text-shadow flex items-center gap-3">
              <PawPrint className="h-8 w-8 text-axonix-700" />
              Pet House
            </h1>
            <p className="text-axonix-600 mt-1">Manage your adorable companions and their accessories</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 px-4 py-2 rounded-lg border border-axonix-400/50 shadow-lg">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-axonix-800">{userLotls.toLocaleString()} Lotls</span>
            </div>
            <Button 
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white shadow-lg ring-2 ring-axonix-600/20"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </Button>
          </div>
        </div>

        <Tabs defaultValue="collection" className="space-y-6">
          <TabsList className="bg-axonix-200/60 border border-axonix-400/30">
            <TabsTrigger value="collection" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              My Collection
            </TabsTrigger>
            <TabsTrigger value="customize" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              Customize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-6">
            {/* Mascot Pet */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  Your Mascot
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pets.find(pet => pet.isMascot) && (
                  <div className="flex items-center gap-6">
                    <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getRarityColor(pets.find(pet => pet.isMascot)!.rarity)} p-1`}>
                      <div className="w-full h-full rounded-full bg-axonix-100/90 flex items-center justify-center">
                        <div className="text-6xl">{getPetEmoji(pets.find(pet => pet.isMascot)!.type)}</div>
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Crown className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-axonix-800">{pets.find(pet => pet.isMascot)!.name}</h3>
                      <p className="text-axonix-600 capitalize">{pets.find(pet => pet.isMascot)!.type}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={`bg-gradient-to-r ${getRarityColor(pets.find(pet => pet.isMascot)!.rarity)} text-white border-0`}>
                          {pets.find(pet => pet.isMascot)!.rarity}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-axonix-700 font-medium">Level {pets.find(pet => pet.isMascot)!.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-axonix-700 font-medium">{pets.find(pet => pet.isMascot)!.happiness}%</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-axonix-600 mb-2">Equipped Accessories:</p>
                        <div className="flex gap-2">
                          {pets.find(pet => pet.isMascot)!.accessories.map(acc => (
                            <Badge key={acc.id} variant="outline" className="border-axonix-400/50 text-axonix-700">
                              {acc.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pet Collection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className={`bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border-2 ${getRarityBorder(pet.rarity)} shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                    pet.isMascot ? 'ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-axonix-100' : ''
                  } ${!pet.isOwned ? 'opacity-75 hover:opacity-90' : ''}`}
                  onClick={() => setSelectedPet(pet)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-4">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(pet.rarity)} p-1`}>
                        <div className={`w-full h-full rounded-full bg-axonix-50/90 flex items-center justify-center ${!pet.isOwned ? 'opacity-30' : ''}`}>
                          {pet.isOwned ? (
                            <div className="text-4xl">
                              {getPetEmoji(pet.type)}
                            </div>
                          ) : (
                            <Lock className="h-8 w-8 text-axonix-400" />
                          )}
                        </div>
                      </div>
                      {pet.isMascot && (
                        <div className="absolute -top-2 -right-2">
                          <Crown className="h-6 w-6 text-yellow-500" />
                        </div>
                      )}
                      {!pet.isOwned && (
                        <div className="absolute inset-0 bg-axonix-800/20 rounded-full flex items-center justify-center">
                          <Lock className="h-8 w-8 text-axonix-600" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`font-bold text-axonix-800 ${!pet.isOwned ? 'opacity-50' : ''}`}>{pet.name}</h3>
                    <p className={`text-sm text-axonix-600 ${!pet.isOwned ? 'opacity-50' : ''}`}>{pet.type}</p>
                    
                    <Badge className={`mt-2 bg-gradient-to-r ${getRarityColor(pet.rarity)} text-white border-0 ${!pet.isOwned ? 'opacity-50' : ''}`}>
                      {pet.rarity}
                    </Badge>

                    {pet.isOwned && (
                      <div className="flex justify-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-axonix-700">Lv.{pet.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="text-axonix-700">{pet.happiness}%</span>
                        </div>
                      </div>
                    )}

                    {!pet.isOwned && (
                      <Button 
                        size="sm" 
                        className="mt-3 bg-gradient-to-r from-axonix-600 to-axonix-700 hover:from-axonix-700 hover:to-axonix-800 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/marketplace?category=pets');
                        }}
                      >
                        Unlock
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <Sparkles className="h-6 w-6 text-axonix-600" />
                  Customize Your Pets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Pet Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-axonix-800 mb-4">Select Pet to Customize</h3>
                    <div className="space-y-3">
                      {pets.filter(pet => pet.isOwned).map((pet) => (
                        <div 
                          key={pet.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedPet?.id === pet.id 
                              ? 'border-axonix-600 bg-axonix-200/60' 
                              : 'border-axonix-300/50 hover:border-axonix-400/50 bg-axonix-100/40'
                          }`}
                          onClick={() => setSelectedPet(pet)}
                        >
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRarityColor(pet.rarity)} p-0.5`}>
                            <div className="w-full h-full rounded-full bg-axonix-50/90 flex items-center justify-center text-xl">
                              {getPetEmoji(pet.type)}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-axonix-800">{pet.name}</p>
                            <p className="text-sm text-axonix-600">{pet.type}</p>
                          </div>
                          {pet.isMascot && <Crown className="h-5 w-5 text-yellow-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessories */}
                  <div>
                    <h3 className="text-lg font-semibold text-axonix-800 mb-4">Accessories</h3>
                    {selectedPet ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {selectedPet.accessories.map((accessory) => (
                            <div 
                              key={accessory.id}
                              className="flex items-center gap-2 p-3 rounded-lg bg-axonix-100/60 border border-axonix-300/50"
                            >
                              <div className="w-8 h-8 rounded bg-axonix-200/60 flex items-center justify-center">
                                {getItemIcon(accessory.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-axonix-800">{accessory.name}</p>
                                <Badge className={`bg-gradient-to-r ${getRarityColor(accessory.rarity)} text-white border-0 text-xs`}>
                                  {accessory.rarity}
                                </Badge>
                              </div>
                              <Button 
                                size="sm" 
                                variant={accessory.isEquipped ? "default" : "outline"}
                                className={accessory.isEquipped ? "bg-axonix-700 text-white" : "border-axonix-400/50 text-axonix-700"}
                              >
                                {accessory.isEquipped ? 'Equipped' : 'Equip'}
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white"
                          onClick={() => router.push('/marketplace?category=accessories')}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Get More Accessories
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-axonix-600">Select a pet to customize</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
