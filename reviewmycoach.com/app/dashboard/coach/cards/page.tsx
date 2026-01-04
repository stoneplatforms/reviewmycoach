'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Link from 'next/link';

// Tier card thresholds - matches xp-service.ts
const TIER_THRESHOLDS = [
  { tier: 1, name: 'Rookie Coach', requiredXp: 0 },
  { tier: 2, name: 'Professional Coach', requiredXp: 3000 },
  { tier: 3, name: 'Elite Coach', requiredXp: 7000 },
  { tier: 4, name: 'Veteran Coach', requiredXp: 12000 },
  { tier: 5, name: 'Legendary Coach', requiredXp: 20000 },
];

function getXpProgress(totalXp: number) {
  const currentTier = TIER_THRESHOLDS.filter(t => totalXp >= t.requiredXp).pop() || TIER_THRESHOLDS[0];
  const nextTier = TIER_THRESHOLDS.find(t => t.requiredXp > totalXp);

  if (!nextTier) {
    return { currentTier, nextTier: null, xpToNext: 0, progressPercent: 100 };
  }

  const xpToNext = nextTier.requiredXp - totalXp;
  const tierRange = nextTier.requiredXp - currentTier.requiredXp;
  const xpInTier = totalXp - currentTier.requiredXp;
  const progressPercent = Math.min(100, Math.round((xpInTier / tierRange) * 100));

  return { currentTier, nextTier, xpToNext, progressPercent };
}

interface MarketplaceCard {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  tier: string;
  rarity: string;
  price: number;
  isFeatured: boolean;
}

interface UserCard {
  id: string;
  cardId: string;
  cardType: 'tier' | 'marketplace';
  cardName: string;
  cardImageUrl: string;
  isActive: boolean;
  unlockedAt?: string;
  purchasedAt?: string;
}

interface TierCard {
  id: string;
  tierNumber: number;
  tierName: string;
  requiredXp: number;
  imageUrl: string;
  description: string;
}

export default function CoachCardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coachUsername, setCoachUsername] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [marketplaceCards, setMarketplaceCards] = useState<MarketplaceCard[]>([]);
  const [tierCards, setTierCards] = useState<TierCard[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showTierCards, setShowTierCards] = useState(false);
  const [settingActive, setSettingActive] = useState<string | null>(null);
  const [unlockingTiers, setUnlockingTiers] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin');
      return;
    }

    loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Get coach username from user role
      const userResponse = await fetch(`/api/auth/user-role?userId=${user.uid}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.role === 'coach') {
          const username = userData.username;
          setCoachUsername(username);
          setCoachId(user.uid);

          // Fetch coach profile to get stored totalXp (no separate XP calculation needed!)
          const coachResponse = await fetch(`/api/coaches/by-username/${username}`);
          let xp = 0;
          if (coachResponse.ok) {
            const coachData = await coachResponse.json();
            xp = coachData.coach?.totalXp || 0;
            setTotalXP(xp);
            setActiveCardId(coachData.coach?.activeCardId || null);
          }

          // Fetch user's cards (includes auto-unlocked tier cards)
          await loadMyCards(user.uid, username, xp);

          // Fetch marketplace
          await loadMarketplace();
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCards = async (userId: string, username?: string, xp?: number) => {
    try {
      // First, fetch the coach profile to get the active card
      let activeCardIdFromProfile: string | null = null;
      if (username) {
        const coachResponse = await fetch(`/api/coaches/by-username/${username}`);
        if (coachResponse.ok) {
          const coachData = await coachResponse.json();
          activeCardIdFromProfile = coachData.coach?.activeCardId || null;
          console.log('🔍 Active card from profile:', activeCardIdFromProfile);
          setActiveCardId(activeCardIdFromProfile);
        } else {
          console.error('Failed to fetch coach profile:', coachResponse.status);
        }
      }

      // Fetch marketplace cards
      const response = await fetch(`/api/cards/user?userId=${userId}`);
      let marketplaceCards: UserCard[] = [];
      if (response.ok) {
        const data = await response.json();
        marketplaceCards = data.cards || [];
      }

      // Fetch tier cards if we have username and XP
      let tierCards: UserCard[] = [];
      if (username && xp !== undefined) {
        const tierResponse = await fetch(`/api/cards/tier/direct?userId=${userId}&username=${username}&xp=${xp}`);
        if (tierResponse.ok) {
          const tierData = await tierResponse.json();
          console.log('🔍 Tier cards API response:', tierData);
          
          // The API returns unlockedCards array
          const unlockedCards = tierData.unlockedCards || [];
          console.log('🔍 Unlocked cards from API:', unlockedCards);
          
          tierCards = unlockedCards.map((card: any) => ({
            id: card.id || card.cardId,
            cardId: card.cardId || card.id,
            cardType: 'tier' as const,
            cardName: card.cardName || card.tierName,
            cardImageUrl: card.cardImageUrl || card.imageUrl,
            isActive: false, // Will be set below based on activeCardIdFromProfile
            unlockedAt: card.unlockedAt || null,
          }));
          
          console.log('✅ Processed tier cards:', tierCards.length, tierCards.map(c => ({ id: c.cardId, name: c.cardName })));
        } else {
          const errorText = await tierResponse.text();
          console.error('❌ Failed to fetch tier cards:', tierResponse.status, errorText);
        }
      } else {
        console.warn('⚠️ Missing username or XP for tier cards:', { username, xp });
      }

      // Merge both types and mark the active card
      const allCards = [...marketplaceCards, ...tierCards].map(card => {
        const isActive = card.cardId === activeCardIdFromProfile;
        if (isActive) {
          console.log('✅ Marking card as active:', card.cardId, card.cardName);
        }
        return {
          ...card,
          isActive
        };
      });
      
      console.log('📊 Total cards loaded:', allCards.length);
      console.log('📊 Active card ID:', activeCardIdFromProfile);
      console.log('📊 Cards with isActive=true:', allCards.filter(c => c.isActive).length);
      
      setMyCards(allCards);
      
      // Set active card ID
      setActiveCardId(activeCardIdFromProfile);
    } catch (error) {
      console.error('Error loading user cards:', error);
    }
  };

  const loadMarketplace = async () => {
    try {
      const response = await fetch('/api/cards/marketplace?limit=50');
      if (response.ok) {
        const data = await response.json();
        setMarketplaceCards(data.cards || []);
      }
    } catch (error) {
      console.error('Error loading marketplace cards:', error);
    }
  };

  // Tier cards are now auto-loaded in loadMyCards - no separate function needed

  const handleSetActive = async (cardId: string, cardImageUrl: string) => {
    if (!user || !coachUsername) return;
    
    setSettingActive(cardId);
    try {
      const token = await user.getIdToken();
      
      // Update coach profile with active card via Data Connect API
      const response = await fetch(`/api/coaches/by-username/${coachUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activeCardId: cardId,
          activeCardImageUrl: cardImageUrl,
        })
      });

      if (response.ok) {
        setActiveCardId(cardId);
        
        // Update local state to show active card
        setMyCards(prev => prev.map(card => ({
          ...card,
          isActive: card.cardId === cardId
        })));
        
        alert('✨ Card activated! It will now appear on your profile.');
      } else {
        const error = await response.json();
        alert(`Failed to activate card: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error setting active card:', error);
      alert('Failed to activate card. Please try again.');
    } finally {
      setSettingActive(null);
    }
  };

  const handleBuyCard = async (cardId: string) => {
    alert('Purchase functionality coming soon! This will integrate with Stripe.');
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/coach"
            className="text-[var(--brand-silver-blue)] hover:text-[#8fa3b1] mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Cards</h1>
          <p className="mt-2 text-gray-600">
            Customize your profile with unique cards that appear with your profile picture
          </p>
        </div>

        {/* XP Progress Card */}
        {totalXP > 0 && (() => {
          const progress = getXpProgress(totalXP);
          return (
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-80">Current Tier</div>
                  <div className="text-2xl font-bold">{progress.currentTier.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{totalXP.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Total XP</div>
                </div>
              </div>

              {progress.nextTier ? (
                <>
                  <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{progress.progressPercent}% to next tier</span>
                    <span>{progress.xpToNext.toLocaleString()} XP to {progress.nextTier.name}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-2 bg-white/20 rounded-lg">
                  🏆 Maximum tier achieved!
                </div>
              )}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setShowMarketplace(false);
                setShowTierCards(false);
              }}
              className={`${
                !showMarketplace && !showTierCards
                  ? 'border-[var(--brand-silver-blue)] text-[var(--brand-silver-blue)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Cards ({myCards.length})
            </button>
            {/* Tier Cards tab removed - all cards show in My Cards */}
            <button
              onClick={() => {
                setShowMarketplace(true);
                setShowTierCards(false);
                if (marketplaceCards.length === 0) {
                  loadMarketplace();
                }
              }}
              className={`${
                showMarketplace
                  ? 'border-[var(--brand-silver-blue)] text-[var(--brand-silver-blue)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Marketplace
            </button>
          </nav>
        </div>

        {/* Tier Cards Section - HIDDEN */}
        {false && showTierCards && (
          <div>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your XP: {totalXP.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Earn XP by completing sessions, getting reviews, and being active on the platform
                  </p>
                </div>
                <button
                  onClick={unlockTierCards}
                  disabled={unlockingTiers}
                  className="btn-brand"
                >
                  {unlockingTiers ? 'Unlocking...' : 'Check for New Tier Cards'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tierCards.map((tierCard) => {
                const isUnlocked = myCards.some(mc => mc.cardId === tierCard.id && mc.cardType === 'tier');
                const canUnlock = totalXP >= tierCard.requiredXp;
                const isActive = activeCardId === tierCard.id;

                return (
                  <div
                    key={tierCard.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                      isActive ? 'border-green-500' : isUnlocked ? 'border-blue-300' : 'border-gray-200'
                    } ${!canUnlock ? 'opacity-50' : ''}`}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={tierCard.imageUrl}
                        alt={tierCard.tierName}
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Active
                        </div>
                      )}
                      {!canUnlock && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="text-center text-white">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="font-semibold">Locked</p>
                            <p className="text-sm">Need {tierCard.requiredXp.toLocaleString()} XP</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tierCard.tierName}</h3>
                        <span className="text-sm font-medium text-gray-600">Tier {tierCard.tierNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{tierCard.description}</p>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600">Required XP:</span>
                        <span className="font-semibold text-gray-900">{tierCard.requiredXp.toLocaleString()}</span>
                      </div>
                      {isUnlocked && (
                        <button
                          onClick={() => handleSetActive(tierCard.id, tierCard.imageUrl)}
                          disabled={settingActive === tierCard.id || isActive}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            isActive
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-[var(--brand-silver-blue)] text-white hover:bg-[#8fa3b1]'
                          }`}
                        >
                          {settingActive === tierCard.id ? 'Setting...' : isActive ? 'Active' : 'Set as Active'}
                        </button>
                      )}
                      {!isUnlocked && canUnlock && (
                        <button
                          onClick={unlockTierCards}
                          className="w-full py-2 px-4 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          Unlock Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {tierCards.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tier cards available</h3>
                <p className="text-gray-600">Tier cards will appear here as you earn XP</p>
              </div>
            )}
          </div>
        )}

        {/* My Cards Section */}
        {!showMarketplace && !showTierCards && (
          <div>
            {myCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
                <p className="text-gray-600 mb-4">
                  Unlock tier cards by earning XP or browse the marketplace to purchase premium cards!
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowTierCards(true);
                      setShowMarketplace(false);
                    }}
                    className="btn-brand inline-block"
                  >
                    View Tier Cards
                  </button>
                  <button
                    onClick={() => {
                      setShowMarketplace(true);
                      setShowTierCards(false);
                      loadMarketplace();
                    }}
                    className="btn-secondary inline-block"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCards.map((card) => {
                  const isActive = card.isActive || card.cardId === activeCardId;
                  return (
                    <div
                      key={card.id}
                      className={`bg-white rounded-lg shadow overflow-hidden transition-all ${
                        isActive 
                          ? 'ring-4 ring-green-500 shadow-lg scale-105' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={card.cardImageUrl}
                          alt={card.cardName}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ✓ Active
                          </div>
                        )}
                        {/* Card Type Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          card.cardType === 'tier' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-purple-500 text-white'
                        }`}>
                          {card.cardType === 'tier' ? '🏆 Tier Card' : '🛒 Marketplace'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{card.cardName}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {card.cardType === 'tier' 
                            ? `Unlocked ${card.unlockedAt ? new Date(card.unlockedAt).toLocaleDateString() : 'recently'}`
                            : `Purchased ${card.purchasedAt ? new Date(card.purchasedAt).toLocaleDateString() : 'recently'}`
                          }
                        </p>
                        {!isActive ? (
                          <button
                            onClick={() => handleSetActive(card.cardId, card.cardImageUrl)}
                            disabled={settingActive === card.cardId}
                            className="w-full btn-brand text-sm disabled:opacity-50"
                          >
                            {settingActive === card.cardId ? 'Activating...' : 'Set as Active'}
                          </button>
                        ) : (
                          <div className="w-full bg-green-100 text-green-700 text-center py-2 rounded-lg font-semibold text-sm">
                            ✓ Currently Active
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Marketplace Section */}
        {showMarketplace && (
          <div>
            {marketplaceCards.length === 0 ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceCards.map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                      {card.isFeatured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {card.tier && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium uppercase">
                          {card.tier}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{card.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{card.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[var(--brand-silver-blue)]">
                          ${card.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleBuyCard(card.id)}
                          className="btn-brand text-sm"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
