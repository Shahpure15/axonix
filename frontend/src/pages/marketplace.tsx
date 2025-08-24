import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Coins, 
  Search,
  Filter,
  Star,
  Crown,
  Gem,
  Gift,
  Lock,
  Check,
  Heart,
  Home,
  Sparkles,
  Zap
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  name: string;
  type: 'pet' | 'accessory';
  category: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  image: string;
  isOwned: boolean;
  isNew: boolean;
  discount?: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { category: urlCategory } = router.query;
  const [selectedCategory, setSelectedCategory] = useState(urlCategory as string || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLotls, setUserLotls] = useState(1250);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  // Mock marketplace data
  const [marketplaceItems] = useState<MarketplaceItem[]>([
    // Pets
    {
      id: 'pet1',
      name: 'Phoenix',
      type: 'pet',
      category: 'pets',
      price: 2500,
      rarity: 'legendary',
      description: 'A majestic phoenix that rises from ashes with incredible fire powers.',
      image: '/pets/phoenix.png',
      isOwned: false,
      isNew: true
    },
    {
      id: 'pet2',
      name: 'Shadow Wolf',
      type: 'pet',
      category: 'pets',
      price: 800,
      rarity: 'rare',
      description: 'A mysterious wolf companion with stealth abilities.',
      image: '/pets/wolf.png',
      isOwned: false,
      isNew: false
    },
    {
      id: 'pet3',
      name: 'Crystal Fox',
      type: 'pet',
      category: 'pets',
      price: 1200,
      rarity: 'epic',
      description: 'A beautiful fox with crystalline fur that sparkles in the light.',
      image: '/pets/fox.png',
      isOwned: false,
      isNew: true
    },
    
    // Accessories - Hats
    {
      id: 'hat1',
      name: 'Royal Crown',
      type: 'accessory',
      category: 'hats',
      price: 300,
      rarity: 'epic',
      description: 'A magnificent crown fit for pet royalty.',
      image: '/accessories/crown.png',
      isOwned: false,
      isNew: false
    },
    {
      id: 'hat2',
      name: 'Wizard Hat',
      type: 'accessory',
      category: 'hats',
      price: 150,
      rarity: 'rare',
      description: 'A mystical hat that enhances magical abilities.',
      image: '/accessories/wizard-hat.png',
      isOwned: true,
      isNew: false
    },
    {
      id: 'hat3',
      name: 'Party Hat',
      type: 'accessory',
      category: 'hats',
      price: 50,
      rarity: 'common',
      description: 'Perfect for celebrating achievements and milestones.',
      image: '/accessories/party-hat.png',
      isOwned: false,
      isNew: false
    },
    
    // Accessories - Collars
    {
      id: 'collar1',
      name: 'Lightning Collar',
      type: 'accessory',
      category: 'collars',
      price: 200,
      rarity: 'rare',
      description: 'A collar that crackles with electric energy.',
      image: '/accessories/lightning-collar.png',
      isOwned: true,
      isNew: false
    },
    {
      id: 'collar2',
      name: 'Diamond Collar',
      type: 'accessory',
      category: 'collars',
      price: 500,
      rarity: 'epic',
      description: 'An elegant collar studded with precious diamonds.',
      image: '/accessories/diamond-collar.png',
      isOwned: false,
      isNew: false
    },
    
    // Accessories - Outfits
    {
      id: 'outfit1',
      name: 'Superhero Cape',
      type: 'accessory',
      category: 'outfits',
      price: 400,
      rarity: 'epic',
      description: 'Transform your pet into a superhero with this heroic cape.',
      image: '/accessories/cape.png',
      isOwned: false,
      isNew: true,
      discount: 20
    },
    {
      id: 'outfit2',
      name: 'Knight Armor',
      type: 'accessory',
      category: 'outfits',
      price: 600,
      rarity: 'legendary',
      description: 'Protective armor that makes your pet look like a brave knight.',
      image: '/accessories/armor.png',
      isOwned: false,
      isNew: false
    },
    
    // Accessories - Backgrounds
    {
      id: 'bg1',
      name: 'Mystical Forest',
      type: 'accessory',
      category: 'backgrounds',
      price: 250,
      rarity: 'rare',
      description: 'A magical forest background with glowing trees.',
      image: '/backgrounds/forest.png',
      isOwned: false,
      isNew: false
    },
    {
      id: 'bg2',
      name: 'Starry Night',
      type: 'accessory',
      category: 'backgrounds',
      price: 180,
      rarity: 'rare',
      description: 'A beautiful night sky filled with twinkling stars.',
      image: '/backgrounds/starry.png',
      isOwned: false,
      isNew: false
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'pets', name: 'Pets', icon: Heart },
    { id: 'hats', name: 'Hats', icon: Crown },
    { id: 'collars', name: 'Collars', icon: Gem },
    { id: 'outfits', name: 'Outfits', icon: Sparkles },
    { id: 'backgrounds', name: 'Backgrounds', icon: Star }
  ];

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

  const filteredItems = marketplaceItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePurchase = (item: MarketplaceItem) => {
    const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price;
    
    if (userLotls >= finalPrice && !item.isOwned) {
      setUserLotls(prev => prev - finalPrice);
      setPurchasedItems(prev => [...prev, item.id]);
      // Here you would typically update the backend/state management
    }
  };

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'pets': return <Heart className="h-8 w-8 text-red-500" />;
      case 'hats': return <Crown className="h-8 w-8 text-yellow-600" />;
      case 'collars': return <Gem className="h-8 w-8 text-purple-600" />;
      case 'outfits': return <Sparkles className="h-8 w-8 text-pink-600" />;
      case 'backgrounds': return <Star className="h-8 w-8 text-blue-600" />;
      default: return <Gift className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPetEmoji = (itemName: string) => {
    if (itemName.includes('Phoenix')) return '🔥';
    if (itemName.includes('Wolf')) return '🐺';
    if (itemName.includes('Fox')) return '🦊';
    if (itemName.includes('Dragon')) return '🐲';
    if (itemName.includes('Unicorn')) return '🦄';
    return '🐾';
  };

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory as string);
    }
  }, [urlCategory]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-axonix-800 axonix-text-shadow flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-axonix-700" />
              Marketplace
            </h1>
            <p className="text-axonix-600 mt-1">Purchase cosmetics and pets using your Lotls</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 px-4 py-2 rounded-lg border border-axonix-400/50 shadow-lg">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-axonix-800">{userLotls.toLocaleString()} Lotls</span>
            </div>
            <Button 
              onClick={() => router.push('/pet-house')}
              variant="outline"
              className="border-axonix-400/50 text-axonix-700 hover:bg-axonix-200/50 shadow-md"
            >
              <Home className="h-4 w-4 mr-2" />
              Pet House
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-axonix-500" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-axonix-400/50 focus:border-axonix-600 bg-white/80"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={
                        selectedCategory === category.id
                          ? "bg-axonix-700 text-white whitespace-nowrap"
                          : "border-axonix-400/50 text-axonix-700 hover:bg-axonix-200/50 whitespace-nowrap"
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwned = item.isOwned || purchasedItems.includes(item.id);
            const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price;
            
            return (
              <Card 
                key={item.id}
                className={`bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border-2 ${getRarityBorder(item.rarity)} shadow-xl hover:scale-105 transition-all duration-300 ${
                  isOwned ? 'opacity-80' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Item Image/Icon */}
                  <div className="relative mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(item.rarity)} p-1`}>
                      <div className="w-full h-full rounded-full bg-axonix-50/90 flex items-center justify-center">
                        {item.type === 'pet' ? (
                          <div className="text-4xl">{getPetEmoji(item.name)}</div>
                        ) : (
                          getItemIcon(item.category)
                        )}
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                      {item.isNew && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs">
                          NEW
                        </Badge>
                      )}
                      {item.discount && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 text-xs">
                          -{item.discount}%
                        </Badge>
                      )}
                      {isOwned && (
                        <div className="bg-green-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-axonix-800">{item.name}</h3>
                    <p className="text-sm text-axonix-600 line-clamp-2">{item.description}</p>
                    
                    <Badge className={`bg-gradient-to-r ${getRarityColor(item.rarity)} text-white border-0`}>
                      {item.rarity}
                    </Badge>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="font-bold text-axonix-800">
                        {item.discount && (
                          <span className="line-through text-axonix-500 mr-2">
                            {item.price.toLocaleString()}
                          </span>
                        )}
                        {finalPrice.toLocaleString()} Lotls
                      </span>
                    </div>

                    {/* Purchase Button */}
                    <Button 
                      className={`w-full mt-3 ${
                        isOwned 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : userLotls >= finalPrice
                            ? 'bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                      onClick={() => handlePurchase(item)}
                      disabled={isOwned || userLotls < finalPrice}
                    >
                      {isOwned ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Owned
                        </>
                      ) : userLotls >= finalPrice ? (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Purchase
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Insufficient Lotls
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-axonix-800 mb-2">No items found</h3>
              <p className="text-axonix-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}

        {/* How to Earn Lotls Info */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
            <CardTitle className="flex items-center gap-2 text-axonix-800">
              <Zap className="h-6 w-6 text-yellow-600" />
              How to Earn Lotls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold text-axonix-800">Complete Tasks</h4>
                <p className="text-sm text-axonix-600">Earn Lotls by completing learning tasks and exercises</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="font-semibold text-axonix-800">Achieve Milestones</h4>
                <p className="text-sm text-axonix-600">Reach learning milestones to earn bonus Lotls</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-axonix-100/60 border border-axonix-300/50">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="font-semibold text-axonix-800">Daily Streaks</h4>
                <p className="text-sm text-axonix-600">Maintain daily learning streaks for consistent rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
