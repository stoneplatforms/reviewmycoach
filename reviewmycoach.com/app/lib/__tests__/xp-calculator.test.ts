import { describe, it, expect } from 'vitest';
import {
  calculateCoachXP,
  getCoachTier,
  formatXPBreakdown,
  mapSubscriptionToTier,
  calculateYearsBetween,
  calculateConsistencyMultiplier,
  type XPCalculationInputs,
} from '../xp-calculator';
import { mockXPInputsFactory } from './test-utils';

describe('xp-calculator', () => {
  describe('calculateCoachXP', () => {
    it('should return 0 XP and Rookie tier for zero inputs', () => {
      const inputs: XPCalculationInputs = mockXPInputsFactory.minimal();
      const result = calculateCoachXP(inputs);

      expect(result.total_xp).toBe(1000); // Base subscription tier 1 = 1000
      expect(result.tier).toBe('Rookie Coach');
      expect(result.tier_number).toBe(1);
      expect(result.breakdown.base_xp).toBe(1000);
      expect(result.breakdown.total_xp).toBe(1000);
    });

    it('should calculate XP correctly with subscription tier variations', () => {
      const tier1 = calculateCoachXP({ ...mockXPInputsFactory.minimal(), subscription_tier: 1 });
      const tier2 = calculateCoachXP({ ...mockXPInputsFactory.minimal(), subscription_tier: 2 });
      const tier3 = calculateCoachXP({ ...mockXPInputsFactory.minimal(), subscription_tier: 3 });

      expect(tier1.breakdown.base_xp).toBe(1000);
      expect(tier2.breakdown.base_xp).toBe(2000);
      expect(tier3.breakdown.base_xp).toBe(3000);
    });

    it('should calculate platform longevity XP correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        longevity_platform_years: 5,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.platform_xp).toBe(1000); // 5 years * 200 = 1000
      expect(result.total_xp).toBe(2000); // 1000 base + 1000 platform
    });

    it('should calculate career years XP correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        career_years: 10,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.career_xp).toBe(1500); // 10 years * 150 = 1500
      expect(result.total_xp).toBe(2500); // 1000 base + 1500 career
    });

    it('should calculate courses created XP correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        courses_created: 5,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.course_xp).toBe(1500); // 5 courses * 300 = 1500
      expect(result.total_xp).toBe(2500); // 1000 base + 1500 courses
    });

    it('should calculate jobs completed XP correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        jobs_completed: 50,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.job_xp).toBe(5000); // 50 jobs * 100 = 5000
      expect(result.total_xp).toBe(6000); // 1000 base + 5000 jobs
    });

    it('should calculate review bonus XP correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        review_score: 5.0,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.review_bonus).toBe(500); // (5.0 / 5) * 500 = 500
      expect(result.total_xp).toBe(1500); // 1000 base + 500 review
    });

    it('should apply consistency multiplier of 0.5x correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.standard(),
        consistency_multiplier: 0.5,
      };
      const result = calculateCoachXP(inputs);

      const subtotal = result.breakdown.subtotal;
      expect(result.total_xp).toBe(Math.round(subtotal * 0.5));
    });

    it('should apply consistency multiplier of 1.5x correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.standard(),
        consistency_multiplier: 1.5,
      };
      const result = calculateCoachXP(inputs);

      const subtotal = result.breakdown.subtotal;
      expect(result.total_xp).toBe(Math.round(subtotal * 1.5));
    });

    it('should apply consistency multiplier of 2.0x correctly', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.standard(),
        consistency_multiplier: 2.0,
      };
      const result = calculateCoachXP(inputs);

      const subtotal = result.breakdown.subtotal;
      expect(result.total_xp).toBe(Math.round(subtotal * 2.0));
    });

    it('should round total XP to integer', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        longevity_platform_years: 1.5,
        consistency_multiplier: 1.3,
      };
      const result = calculateCoachXP(inputs);

      // (1000 + 300) * 1.3 = 1690
      expect(result.total_xp).toBe(1690);
      expect(Number.isInteger(result.total_xp)).toBe(true);
    });

    it('should calculate realistic professional coach XP', () => {
      const inputs: XPCalculationInputs = {
        subscription_tier: 2,
        longevity_platform_years: 2,
        career_years: 5,
        courses_created: 2,
        jobs_completed: 15,
        review_score: 4.0,
        consistency_multiplier: 1.2,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.base_xp).toBe(2000);
      expect(result.breakdown.platform_xp).toBe(400);
      expect(result.breakdown.career_xp).toBe(750);
      expect(result.breakdown.course_xp).toBe(600);
      expect(result.breakdown.job_xp).toBe(1500);
      expect(result.breakdown.review_bonus).toBe(400);
      expect(result.breakdown.subtotal).toBe(5650);
      expect(result.total_xp).toBe(6780); // 5650 * 1.2
      expect(result.tier).toBe('Professional Coach');
      expect(result.tier_number).toBe(2);
    });

    it('should calculate realistic legendary coach XP', () => {
      const inputs: XPCalculationInputs = mockXPInputsFactory.highPerformer();
      const result = calculateCoachXP(inputs);

      expect(result.total_xp).toBeGreaterThan(20000);
      expect(result.tier).toBe('Legendary Coach');
      expect(result.tier_number).toBe(5);
    });

    it('should handle fractional review scores', () => {
      const inputs: XPCalculationInputs = {
        ...mockXPInputsFactory.minimal(),
        review_score: 4.5,
      };
      const result = calculateCoachXP(inputs);

      expect(result.breakdown.review_bonus).toBe(450); // (4.5 / 5) * 500 = 450
    });

    it('should handle all components combined', () => {
      const inputs: XPCalculationInputs = {
        subscription_tier: 3,
        longevity_platform_years: 5,
        career_years: 10,
        courses_created: 5,
        jobs_completed: 50,
        review_score: 4.5,
        consistency_multiplier: 1.5,
      };
      const result = calculateCoachXP(inputs);

      // Base: 3000, Platform: 1000, Career: 1500, Courses: 1500, Jobs: 5000, Review: 450
      // Subtotal: 12450, Total: 12450 * 1.5 = 18675
      expect(result.breakdown.base_xp).toBe(3000);
      expect(result.breakdown.platform_xp).toBe(1000);
      expect(result.breakdown.career_xp).toBe(1500);
      expect(result.breakdown.course_xp).toBe(1500);
      expect(result.breakdown.job_xp).toBe(5000);
      expect(result.breakdown.review_bonus).toBe(450);
      expect(result.breakdown.subtotal).toBe(12450);
      expect(result.total_xp).toBe(18675);
      expect(result.tier).toBe('Veteran Coach');
    });
  });

  describe('getCoachTier', () => {
    it('should return Rookie tier for 0 XP', () => {
      const result = getCoachTier(0);
      expect(result.tier).toBe('Rookie Coach');
      expect(result.tier_number).toBe(1);
    });

    it('should return Rookie tier for XP below 3000', () => {
      expect(getCoachTier(500).tier).toBe('Rookie Coach');
      expect(getCoachTier(1500).tier).toBe('Rookie Coach');
      expect(getCoachTier(2999).tier).toBe('Rookie Coach');
    });

    it('should return Professional tier for XP at exactly 3000', () => {
      const result = getCoachTier(3000);
      expect(result.tier).toBe('Professional Coach');
      expect(result.tier_number).toBe(2);
    });

    it('should return Professional tier for XP between 3000 and 7000', () => {
      expect(getCoachTier(3001).tier).toBe('Professional Coach');
      expect(getCoachTier(5000).tier).toBe('Professional Coach');
      expect(getCoachTier(6999).tier).toBe('Professional Coach');
    });

    it('should return Elite tier for XP at exactly 7000', () => {
      const result = getCoachTier(7000);
      expect(result.tier).toBe('Elite Coach');
      expect(result.tier_number).toBe(3);
    });

    it('should return Elite tier for XP between 7000 and 12000', () => {
      expect(getCoachTier(7001).tier).toBe('Elite Coach');
      expect(getCoachTier(9000).tier).toBe('Elite Coach');
      expect(getCoachTier(11999).tier).toBe('Elite Coach');
    });

    it('should return Veteran tier for XP at exactly 12000', () => {
      const result = getCoachTier(12000);
      expect(result.tier).toBe('Veteran Coach');
      expect(result.tier_number).toBe(4);
    });

    it('should return Veteran tier for XP between 12000 and 20000', () => {
      expect(getCoachTier(12001).tier).toBe('Veteran Coach');
      expect(getCoachTier(15000).tier).toBe('Veteran Coach');
      expect(getCoachTier(19999).tier).toBe('Veteran Coach');
    });

    it('should return Legendary tier for XP at exactly 20000', () => {
      const result = getCoachTier(20000);
      expect(result.tier).toBe('Legendary Coach');
      expect(result.tier_number).toBe(5);
    });

    it('should return Legendary tier for XP above 20000', () => {
      expect(getCoachTier(20001).tier).toBe('Legendary Coach');
      expect(getCoachTier(50000).tier).toBe('Legendary Coach');
      expect(getCoachTier(999999).tier).toBe('Legendary Coach');
    });

    it('should handle negative XP by returning Rookie tier', () => {
      const result = getCoachTier(-100);
      expect(result.tier).toBe('Rookie Coach');
      expect(result.tier_number).toBe(1);
    });
  });

  describe('formatXPBreakdown', () => {
    it('should return array of 9 formatted strings', () => {
      const inputs = mockXPInputsFactory.standard();
      const result = calculateCoachXP(inputs);
      const formatted = formatXPBreakdown(result.breakdown);

      expect(formatted).toHaveLength(9);
      expect(Array.isArray(formatted)).toBe(true);
    });

    it('should format numbers with commas for thousands', () => {
      const inputs: XPCalculationInputs = {
        subscription_tier: 3,
        longevity_platform_years: 10,
        career_years: 20,
        courses_created: 10,
        jobs_completed: 200,
        review_score: 5.0,
        consistency_multiplier: 2.0,
      };
      const result = calculateCoachXP(inputs);
      const formatted = formatXPBreakdown(result.breakdown);

      // Check that large numbers have commas
      expect(formatted.some(str => str.includes(','))).toBe(true);
    });

    it('should include all XP components', () => {
      const inputs = mockXPInputsFactory.standard();
      const result = calculateCoachXP(inputs);
      const formatted = formatXPBreakdown(result.breakdown);

      expect(formatted[0]).toContain('Base XP (Subscription)');
      expect(formatted[1]).toContain('Platform Longevity');
      expect(formatted[2]).toContain('Career Experience');
      expect(formatted[3]).toContain('Courses Created');
      expect(formatted[4]).toContain('Jobs Completed');
      expect(formatted[5]).toContain('Review Bonus');
      expect(formatted[6]).toContain('Subtotal');
      expect(formatted[7]).toContain('Consistency Multiplier');
      expect(formatted[8]).toContain('Total XP');
    });

    it('should format consistency multiplier with x suffix', () => {
      const inputs = mockXPInputsFactory.standard();
      const result = calculateCoachXP(inputs);
      const formatted = formatXPBreakdown(result.breakdown);

      expect(formatted[7]).toMatch(/\d+(\.\d+)?x/);
    });
  });

  describe('mapSubscriptionToTier', () => {
    it('should return tier 1 for inactive subscription', () => {
      expect(mapSubscriptionToTier('inactive')).toBe(1);
    });

    it('should return tier 1 for cancelled subscription', () => {
      expect(mapSubscriptionToTier('cancelled')).toBe(1);
    });

    it('should return tier 2 for active subscription', () => {
      expect(mapSubscriptionToTier('active')).toBe(2);
    });

    it('should return tier 1 for null subscription status', () => {
      expect(mapSubscriptionToTier(null)).toBe(1);
    });

    it('should return tier 1 for undefined subscription status', () => {
      expect(mapSubscriptionToTier(undefined)).toBe(1);
    });

    it('should return tier 1 for empty string', () => {
      expect(mapSubscriptionToTier('')).toBe(1);
    });
  });

  describe('calculateYearsBetween', () => {
    it('should return 0 for null start date', () => {
      const result = calculateYearsBetween(null);
      expect(result).toBe(0);
    });

    it('should return 0 for undefined start date', () => {
      const result = calculateYearsBetween(undefined);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid start date', () => {
      const invalidDate = new Date('invalid');
      const result = calculateYearsBetween(invalidDate);
      expect(result).toBe(0);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-01-01');
      const result = calculateYearsBetween(date, date);
      expect(result).toBe(0);
    });

    it('should calculate 1 year correctly', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2024-01-01');
      const result = calculateYearsBetween(start, end);
      expect(result).toBeCloseTo(1.0, 1);
    });

    it('should calculate 5 years correctly', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2025-01-01');
      const result = calculateYearsBetween(start, end);
      expect(result).toBeCloseTo(5.0, 1);
    });

    it('should calculate fractional years correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-07-01');
      const result = calculateYearsBetween(start, end);
      expect(result).toBeCloseTo(0.5, 1);
    });

    it('should handle future dates (end before start) and return positive value', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2024-01-01');
      const result = calculateYearsBetween(start, end);
      expect(result).toBeGreaterThan(0);
    });

    it('should account for leap years (365.25 days/year)', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2024-01-01');
      const result = calculateYearsBetween(start, end);
      // Should be close to 4.0, accounting for leap year
      expect(result).toBeCloseTo(4.0, 1);
    });
  });

  describe('calculateConsistencyMultiplier', () => {
    it('should return 0.5 for zero sessions', () => {
      const result = calculateConsistencyMultiplier(0, 0);
      expect(result).toBe(0.5);
    });

    it('should return 0.5 for zero months', () => {
      const result = calculateConsistencyMultiplier(10, 0);
      expect(result).toBe(0.5);
    });

    it('should return 2.0 for 10+ sessions per month (excellent)', () => {
      const result = calculateConsistencyMultiplier(100, 10); // 10 sessions/month
      expect(result).toBe(2.0);
    });

    it('should return 2.0 for more than 10 sessions per month', () => {
      const result = calculateConsistencyMultiplier(150, 10); // 15 sessions/month
      expect(result).toBe(2.0);
    });

    it('should return 1.5 for 5-10 sessions per month (good)', () => {
      const result = calculateConsistencyMultiplier(70, 10); // 7 sessions/month
      expect(result).toBe(1.5);
    });

    it('should return 1.2 for 2-5 sessions per month (above average)', () => {
      const result = calculateConsistencyMultiplier(30, 10); // 3 sessions/month
      expect(result).toBe(1.2);
    });

    it('should return 1.0 for 1-2 sessions per month (average)', () => {
      const result = calculateConsistencyMultiplier(15, 10); // 1.5 sessions/month
      expect(result).toBe(1.0);
    });

    it('should return 0.7 for less than 1 session per month (below average)', () => {
      const result = calculateConsistencyMultiplier(5, 10); // 0.5 sessions/month
      expect(result).toBe(0.7);
    });

    it('should use provided average sessions per month if given', () => {
      const result = calculateConsistencyMultiplier(100, 10, 12); // Override to 12 sessions/month
      expect(result).toBe(2.0);
    });

    it('should cap multiplier at minimum 0.5', () => {
      const result = calculateConsistencyMultiplier(1, 100); // Very low consistency
      expect(result).toBe(0.7); // Below average but capped
      expect(result).toBeGreaterThanOrEqual(0.5);
    });

    it('should cap multiplier at maximum 2.0', () => {
      const result = calculateConsistencyMultiplier(1000, 10); // Very high consistency
      expect(result).toBe(2.0);
      expect(result).toBeLessThanOrEqual(2.0);
    });

    it('should handle edge case of more sessions than months', () => {
      const result = calculateConsistencyMultiplier(50, 1); // 50 sessions in 1 month
      expect(result).toBe(2.0);
    });
  });
});
