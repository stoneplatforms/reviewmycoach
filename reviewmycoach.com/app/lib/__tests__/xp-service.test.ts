import { describe, it, expect } from 'vitest';
import {
  TIER_CARDS,
  getEligibleTierCards,
  getHighestTierCard,
  getNextTierCard,
  getXpProgress,
  calculateXpFromCoach,
  hasXpAffectingChanges,
  XP_AFFECTING_FIELDS,
} from '../xp-service';
import { mockCoachFactory } from './test-utils';

describe('xp-service', () => {
  describe('TIER_CARDS constant', () => {
    it('should have exactly 5 tier cards', () => {
      expect(TIER_CARDS).toHaveLength(5);
    });

    it('should have all required fields for each card', () => {
      TIER_CARDS.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('tierNumber');
        expect(card).toHaveProperty('tierName');
        expect(card).toHaveProperty('requiredXp');
        expect(card).toHaveProperty('imageUrl');
        expect(card).toHaveProperty('description');
      });
    });

    it('should have tier numbers in ascending order', () => {
      const tierNumbers = TIER_CARDS.map(card => card.tierNumber);
      expect(tierNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have correct XP thresholds', () => {
      expect(TIER_CARDS[0].requiredXp).toBe(0);
      expect(TIER_CARDS[1].requiredXp).toBe(3000);
      expect(TIER_CARDS[2].requiredXp).toBe(7000);
      expect(TIER_CARDS[3].requiredXp).toBe(12000);
      expect(TIER_CARDS[4].requiredXp).toBe(20000);
    });

    it('should have correct tier names', () => {
      expect(TIER_CARDS[0].tierName).toBe('Rookie Coach');
      expect(TIER_CARDS[1].tierName).toBe('Professional Coach');
      expect(TIER_CARDS[2].tierName).toBe('Elite Coach');
      expect(TIER_CARDS[3].tierName).toBe('Veteran Coach');
      expect(TIER_CARDS[4].tierName).toBe('Legendary Coach');
    });

    it('should have correct image URLs', () => {
      expect(TIER_CARDS[0].imageUrl).toBe('/cards/tier-1.png');
      expect(TIER_CARDS[1].imageUrl).toBe('/cards/tier-2.png');
      expect(TIER_CARDS[2].imageUrl).toBe('/cards/tier-3.png');
      expect(TIER_CARDS[3].imageUrl).toBe('/cards/tier-4.png');
      expect(TIER_CARDS[4].imageUrl).toBe('/cards/tier-5.png');
    });
  });

  describe('getEligibleTierCards', () => {
    it('should return only Rookie card for 0 XP', () => {
      const eligible = getEligibleTierCards(0);
      expect(eligible).toHaveLength(1);
      expect(eligible[0].tierNumber).toBe(1);
    });

    it('should return only Rookie card for XP below 3000', () => {
      expect(getEligibleTierCards(500)).toHaveLength(1);
      expect(getEligibleTierCards(1500)).toHaveLength(1);
      expect(getEligibleTierCards(2999)).toHaveLength(1);
    });

    it('should return Rookie and Professional cards for exactly 3000 XP', () => {
      const eligible = getEligibleTierCards(3000);
      expect(eligible).toHaveLength(2);
      expect(eligible.map(c => c.tierNumber)).toEqual([1, 2]);
    });

    it('should return first 2 tiers for XP between 3000 and 7000', () => {
      expect(getEligibleTierCards(3001)).toHaveLength(2);
      expect(getEligibleTierCards(5000)).toHaveLength(2);
      expect(getEligibleTierCards(6999)).toHaveLength(2);
    });

    it('should return first 3 tiers for exactly 7000 XP', () => {
      const eligible = getEligibleTierCards(7000);
      expect(eligible).toHaveLength(3);
      expect(eligible.map(c => c.tierNumber)).toEqual([1, 2, 3]);
    });

    it('should return first 3 tiers for XP between 7000 and 12000', () => {
      expect(getEligibleTierCards(7001)).toHaveLength(3);
      expect(getEligibleTierCards(9000)).toHaveLength(3);
      expect(getEligibleTierCards(11999)).toHaveLength(3);
    });

    it('should return first 4 tiers for exactly 12000 XP', () => {
      const eligible = getEligibleTierCards(12000);
      expect(eligible).toHaveLength(4);
      expect(eligible.map(c => c.tierNumber)).toEqual([1, 2, 3, 4]);
    });

    it('should return first 4 tiers for XP between 12000 and 20000', () => {
      expect(getEligibleTierCards(12001)).toHaveLength(4);
      expect(getEligibleTierCards(15000)).toHaveLength(4);
      expect(getEligibleTierCards(19999)).toHaveLength(4);
    });

    it('should return all 5 tiers for exactly 20000 XP', () => {
      const eligible = getEligibleTierCards(20000);
      expect(eligible).toHaveLength(5);
      expect(eligible.map(c => c.tierNumber)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return all 5 tiers for XP above 20000', () => {
      expect(getEligibleTierCards(20001)).toHaveLength(5);
      expect(getEligibleTierCards(50000)).toHaveLength(5);
      expect(getEligibleTierCards(999999)).toHaveLength(5);
    });

    it('should include all lower tiers when qualified for higher tier', () => {
      const eligible = getEligibleTierCards(15000); // Veteran tier
      expect(eligible).toHaveLength(4);
      expect(eligible[0].tierName).toBe('Rookie Coach');
      expect(eligible[1].tierName).toBe('Professional Coach');
      expect(eligible[2].tierName).toBe('Elite Coach');
      expect(eligible[3].tierName).toBe('Veteran Coach');
    });
  });

  describe('getHighestTierCard', () => {
    it('should return Rookie card for 0 XP', () => {
      const highest = getHighestTierCard(0);
      expect(highest.tierNumber).toBe(1);
      expect(highest.tierName).toBe('Rookie Coach');
    });

    it('should return Rookie card for XP below 3000', () => {
      expect(getHighestTierCard(2999).tierNumber).toBe(1);
    });

    it('should return Professional card for 3000 XP', () => {
      const highest = getHighestTierCard(3000);
      expect(highest.tierNumber).toBe(2);
      expect(highest.tierName).toBe('Professional Coach');
    });

    it('should return Professional card for XP between 3000 and 7000', () => {
      expect(getHighestTierCard(5000).tierNumber).toBe(2);
    });

    it('should return Elite card for 7000 XP', () => {
      const highest = getHighestTierCard(7000);
      expect(highest.tierNumber).toBe(3);
      expect(highest.tierName).toBe('Elite Coach');
    });

    it('should return Elite card for XP between 7000 and 12000', () => {
      expect(getHighestTierCard(9000).tierNumber).toBe(3);
    });

    it('should return Veteran card for 12000 XP', () => {
      const highest = getHighestTierCard(12000);
      expect(highest.tierNumber).toBe(4);
      expect(highest.tierName).toBe('Veteran Coach');
    });

    it('should return Veteran card for XP between 12000 and 20000', () => {
      expect(getHighestTierCard(15000).tierNumber).toBe(4);
    });

    it('should return Legendary card for 20000 XP', () => {
      const highest = getHighestTierCard(20000);
      expect(highest.tierNumber).toBe(5);
      expect(highest.tierName).toBe('Legendary Coach');
    });

    it('should return Legendary card for XP above 20000', () => {
      expect(getHighestTierCard(50000).tierNumber).toBe(5);
      expect(getHighestTierCard(999999).tierNumber).toBe(5);
    });
  });

  describe('getNextTierCard', () => {
    it('should return Professional card for Rookie (0 XP)', () => {
      const next = getNextTierCard(0);
      expect(next).not.toBeNull();
      expect(next?.tierNumber).toBe(2);
      expect(next?.tierName).toBe('Professional Coach');
    });

    it('should return Professional card for XP below 3000', () => {
      const next = getNextTierCard(2999);
      expect(next?.tierNumber).toBe(2);
    });

    it('should return Elite card for Professional tier (3000 XP)', () => {
      const next = getNextTierCard(3000);
      expect(next?.tierNumber).toBe(3);
      expect(next?.tierName).toBe('Elite Coach');
    });

    it('should return Elite card for XP between 3000 and 7000', () => {
      expect(getNextTierCard(5000)?.tierNumber).toBe(3);
    });

    it('should return Veteran card for Elite tier (7000 XP)', () => {
      const next = getNextTierCard(7000);
      expect(next?.tierNumber).toBe(4);
      expect(next?.tierName).toBe('Veteran Coach');
    });

    it('should return Veteran card for XP between 7000 and 12000', () => {
      expect(getNextTierCard(9000)?.tierNumber).toBe(4);
    });

    it('should return Legendary card for Veteran tier (12000 XP)', () => {
      const next = getNextTierCard(12000);
      expect(next?.tierNumber).toBe(5);
      expect(next?.tierName).toBe('Legendary Coach');
    });

    it('should return Legendary card for XP between 12000 and 20000', () => {
      expect(getNextTierCard(15000)?.tierNumber).toBe(5);
    });

    it('should return null for Legendary tier (20000+ XP)', () => {
      expect(getNextTierCard(20000)).toBeNull();
      expect(getNextTierCard(50000)).toBeNull();
      expect(getNextTierCard(999999)).toBeNull();
    });
  });

  describe('getXpProgress', () => {
    it('should return 0% progress at tier start (0 XP)', () => {
      const progress = getXpProgress(0);

      expect(progress.currentTier.tierNumber).toBe(1);
      expect(progress.nextTier?.tierNumber).toBe(2);
      expect(progress.xpToNext).toBe(3000);
      expect(progress.progressPercent).toBe(0);
    });

    it('should return 50% progress at mid-tier (1500 XP in Rookie)', () => {
      const progress = getXpProgress(1500);

      expect(progress.currentTier.tierNumber).toBe(1);
      expect(progress.nextTier?.tierNumber).toBe(2);
      expect(progress.xpToNext).toBe(1500);
      expect(progress.progressPercent).toBe(50);
    });

    it('should return ~100% progress just before next tier (2999 XP)', () => {
      const progress = getXpProgress(2999);

      expect(progress.currentTier.tierNumber).toBe(1);
      expect(progress.nextTier?.tierNumber).toBe(2);
      expect(progress.xpToNext).toBe(1);
      expect(progress.progressPercent).toBeGreaterThan(99);
    });

    it('should return 0% progress at tier threshold (3000 XP)', () => {
      const progress = getXpProgress(3000);

      expect(progress.currentTier.tierNumber).toBe(2);
      expect(progress.nextTier?.tierNumber).toBe(3);
      expect(progress.xpToNext).toBe(4000); // 7000 - 3000
      expect(progress.progressPercent).toBe(0);
    });

    it('should calculate progress correctly in Professional tier (5000 XP)', () => {
      const progress = getXpProgress(5000);

      expect(progress.currentTier.tierNumber).toBe(2);
      expect(progress.nextTier?.tierNumber).toBe(3);
      expect(progress.xpToNext).toBe(2000); // 7000 - 5000
      // Professional tier: 3000-7000 (range: 4000)
      // XP in tier: 5000 - 3000 = 2000
      // Progress: 2000 / 4000 = 50%
      expect(progress.progressPercent).toBe(50);
    });

    it('should calculate progress correctly in Elite tier (9000 XP)', () => {
      const progress = getXpProgress(9000);

      expect(progress.currentTier.tierNumber).toBe(3);
      expect(progress.nextTier?.tierNumber).toBe(4);
      expect(progress.xpToNext).toBe(3000); // 12000 - 9000
      // Elite tier: 7000-12000 (range: 5000)
      // XP in tier: 9000 - 7000 = 2000
      // Progress: 2000 / 5000 = 40%
      expect(progress.progressPercent).toBe(40);
    });

    it('should calculate progress correctly in Veteran tier (15000 XP)', () => {
      const progress = getXpProgress(15000);

      expect(progress.currentTier.tierNumber).toBe(4);
      expect(progress.nextTier?.tierNumber).toBe(5);
      expect(progress.xpToNext).toBe(5000); // 20000 - 15000
      // Veteran tier: 12000-20000 (range: 8000)
      // XP in tier: 15000 - 12000 = 3000
      // Progress: 3000 / 8000 = 37.5% -> rounds to 38%
      expect(progress.progressPercent).toBe(38);
    });

    it('should return 100% progress and null next tier for Legendary (20000 XP)', () => {
      const progress = getXpProgress(20000);

      expect(progress.currentTier.tierNumber).toBe(5);
      expect(progress.nextTier).toBeNull();
      expect(progress.xpToNext).toBe(0);
      expect(progress.progressPercent).toBe(100);
    });

    it('should return 100% progress for XP above Legendary (50000 XP)', () => {
      const progress = getXpProgress(50000);

      expect(progress.currentTier.tierNumber).toBe(5);
      expect(progress.nextTier).toBeNull();
      expect(progress.xpToNext).toBe(0);
      expect(progress.progressPercent).toBe(100);
    });

    it('should never exceed 100% progress', () => {
      const testValues = [0, 1500, 3000, 5000, 7000, 9000, 12000, 15000, 20000, 50000];
      testValues.forEach(xp => {
        const progress = getXpProgress(xp);
        expect(progress.progressPercent).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('calculateXpFromCoach', () => {
    it('should return 0 XP for coach with all null fields', () => {
      const coach = {
        subscriptionTier: null,
        longevityPlatformYears: null,
        careerYears: null,
        coursesCreated: null,
        jobsCompleted: null,
        averageRating: null,
        consistencyMultiplier: null,
      };
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBe(0);
    });

    it('should return 0 XP for coach with all undefined fields', () => {
      const coach = {};
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBe(0);
    });

    it('should calculate XP from rookie coach data', () => {
      const coach = mockCoachFactory.rookie();
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBe(1000); // Base tier 1 = 1000 XP
    });

    it('should calculate XP from professional coach data', () => {
      const coach = mockCoachFactory.professional();
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBe(6780); // Calculated from professional mock
    });

    it('should calculate XP from elite coach data', () => {
      const coach = mockCoachFactory.elite();
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBeGreaterThan(7000); // Elite tier
    });

    it('should handle partial data correctly', () => {
      const coach = {
        subscriptionTier: 2,
        longevityPlatformYears: 1,
        careerYears: null,
        coursesCreated: null,
        jobsCompleted: null,
        averageRating: null,
        consistencyMultiplier: 1.0,
      };
      const xp = calculateXpFromCoach(coach);
      // (2000 + 200 + 0 + 0 + 0 + 0) * 1.0 = 2200
      expect(xp).toBe(2200);
    });

    it('should handle string numbers and convert to numbers', () => {
      const coach = {
        subscriptionTier: '2' as any,
        longevityPlatformYears: '5' as any,
        careerYears: '10' as any,
        coursesCreated: '3' as any,
        jobsCompleted: '20' as any,
        averageRating: '4.0' as any,
        consistencyMultiplier: '1.5' as any,
      };
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBeGreaterThan(0);
      expect(typeof xp).toBe('number');
    });

    it('should default consistencyMultiplier to 1.0 if null', () => {
      const coach = {
        subscriptionTier: 1,
        longevityPlatformYears: 0,
        careerYears: 0,
        coursesCreated: 0,
        jobsCompleted: 0,
        averageRating: 0,
        consistencyMultiplier: null,
      };
      const xp = calculateXpFromCoach(coach);
      expect(xp).toBe(1000); // Base 1000 * 1.0 = 1000
    });
  });

  describe('hasXpAffectingChanges', () => {
    it('should return false for empty object', () => {
      expect(hasXpAffectingChanges({})).toBe(false);
    });

    it('should return false for non-XP field changes', () => {
      expect(hasXpAffectingChanges({ username: 'new' })).toBe(false);
      expect(hasXpAffectingChanges({ email: 'new@example.com' })).toBe(false);
      expect(hasXpAffectingChanges({ displayName: 'New Name' })).toBe(false);
    });

    it('should return true for subscriptionTier change', () => {
      expect(hasXpAffectingChanges({ subscriptionTier: 2 })).toBe(true);
    });

    it('should return true for longevityPlatformYears change', () => {
      expect(hasXpAffectingChanges({ longevityPlatformYears: 5 })).toBe(true);
    });

    it('should return true for careerYears change', () => {
      expect(hasXpAffectingChanges({ careerYears: 10 })).toBe(true);
    });

    it('should return true for coursesCreated change', () => {
      expect(hasXpAffectingChanges({ coursesCreated: 3 })).toBe(true);
    });

    it('should return true for jobsCompleted change', () => {
      expect(hasXpAffectingChanges({ jobsCompleted: 50 })).toBe(true);
    });

    it('should return true for averageRating change', () => {
      expect(hasXpAffectingChanges({ averageRating: 4.5 })).toBe(true);
    });

    it('should return true for consistencyMultiplier change', () => {
      expect(hasXpAffectingChanges({ consistencyMultiplier: 1.5 })).toBe(true);
    });

    it('should return true even if XP field is mixed with non-XP fields', () => {
      expect(hasXpAffectingChanges({
        username: 'new',
        subscriptionTier: 2,
        email: 'new@example.com'
      })).toBe(true);
    });

    it('should return true for multiple XP-affecting field changes', () => {
      expect(hasXpAffectingChanges({
        subscriptionTier: 2,
        jobsCompleted: 50,
        averageRating: 4.5
      })).toBe(true);
    });
  });

  describe('XP_AFFECTING_FIELDS constant', () => {
    it('should have exactly 7 fields', () => {
      expect(XP_AFFECTING_FIELDS).toHaveLength(7);
    });

    it('should include all expected fields', () => {
      expect(XP_AFFECTING_FIELDS).toContain('subscriptionTier');
      expect(XP_AFFECTING_FIELDS).toContain('longevityPlatformYears');
      expect(XP_AFFECTING_FIELDS).toContain('careerYears');
      expect(XP_AFFECTING_FIELDS).toContain('coursesCreated');
      expect(XP_AFFECTING_FIELDS).toContain('jobsCompleted');
      expect(XP_AFFECTING_FIELDS).toContain('averageRating');
      expect(XP_AFFECTING_FIELDS).toContain('consistencyMultiplier');
    });
  });
});
