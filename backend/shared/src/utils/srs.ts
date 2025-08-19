/**
 * SRS (Spaced Repetition System) Algorithm Implementation
 * Based on SM-2 variant with weighted quality scoring
 */

export interface SRSQualityInput {
  auto_score: number; // 0-1 from automated scoring
  self_rating: number; // 0-5 from user self-assessment
  time_factor: number; // 0-5 normalized time performance
  hint_level_used: number; // 0-5 highest hint level used
}

export interface SRSItem {
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: Date;
}

export interface SRSUpdateResult extends SRSItem {
  quality: number;
  should_reset: boolean;
}

/**
 * Calculate weighted quality score from multiple factors
 */
export function calculateQuality(input: SRSQualityInput): number {
  const { auto_score, self_rating, time_factor, hint_level_used } = input;
  
  // Convert auto_score (0-1) to 0-5 scale
  const q_auto = auto_score * 5;
  
  // Self rating is already 0-5
  const q_self = self_rating;
  
  // Time factor is already 0-5
  const q_time = time_factor;
  
  // Hint penalty: each level used reduces quality
  const hint_penalty = hint_level_used * 0.5; // level 2 = 1.0 penalty
  
  // Weighted combination (50% auto, 30% self, 10% time, 10% hint penalty)
  const q_raw = (0.5 * q_auto) + (0.3 * q_self) + (0.1 * q_time);
  
  // Apply hint penalty (scaled by 10% of total score)
  const q = Math.max(0, q_raw - (hint_penalty * 0.1));
  
  return Math.min(5, q); // Cap at 5
}

/**
 * Update SRS item based on SM-2 algorithm
 */
export function updateSRSItem(
  currentItem: SRSItem,
  qualityInput: SRSQualityInput,
  currentDate: Date = new Date()
): SRSUpdateResult {
  const quality = calculateQuality(qualityInput);
  const { repetitions, ease_factor, interval_days } = currentItem;
  
  let newRepetitions = repetitions;
  let newEaseFactor = ease_factor;
  let newInterval = interval_days;
  let shouldReset = false;
  
  if (quality < 3) {
    // Poor performance - reset repetitions
    newRepetitions = 0;
    newInterval = 1;
    shouldReset = true;
  } else {
    // Good performance - increment repetitions
    newRepetitions = repetitions + 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval_days * ease_factor);
    }
  }
  
  // Update ease factor based on performance
  newEaseFactor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate next review date
  const nextReviewDate = new Date(currentDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    repetitions: newRepetitions,
    ease_factor: parseFloat(newEaseFactor.toFixed(2)),
    interval_days: newInterval,
    next_review_date: nextReviewDate,
    quality: parseFloat(quality.toFixed(2)),
    should_reset: shouldReset,
  };
}

/**
 * Calculate time factor based on solution time vs expected time
 */
export function calculateTimeFactor(
  actualTimeSeconds: number,
  expectedTimeSeconds: number = 300
): number {
  if (actualTimeSeconds <= 0) return 0;
  
  const ratio = actualTimeSeconds / expectedTimeSeconds;
  
  if (ratio <= 0.5) return 5; // Very fast
  if (ratio <= 0.75) return 4; // Fast
  if (ratio <= 1.0) return 3; // On time
  if (ratio <= 1.5) return 2; // Slow
  if (ratio <= 2.0) return 1; // Very slow
  
  return 0; // Extremely slow
}

/**
 * Get due SRS items for a user
 */
export function isDue(item: SRSItem, currentDate: Date = new Date()): boolean {
  return item.next_review_date <= currentDate;
}

/**
 * Calculate optimal study interval for new items
 */
export function calculateInitialInterval(
  userMasteryScore: number, // 0-1
  questionDifficulty: 'easy' | 'medium' | 'hard'
): number {
  const baseInterval = 1;
  const masteryMultiplier = Math.max(0.5, userMasteryScore);
  
  const difficultyMultiplier = {
    easy: 1.0,
    medium: 0.8,
    hard: 0.6,
  };
  
  return Math.max(
    1,
    Math.round(baseInterval * masteryMultiplier * difficultyMultiplier[questionDifficulty])
  );
}