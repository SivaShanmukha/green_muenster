import type { Badge } from '../types';

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_journey',
    name: 'First Steps',
    description: 'Complete your first sustainable journey',
    icon: '🌱',
    earned: false
  },
  {
    id: 'co2_saver_1kg',
    name: 'CO₂ Saver',
    description: 'Save 1kg of CO₂ emissions',
    icon: '🌿',
    earned: false
  },
  {
    id: 'co2_saver_5kg',
    name: 'Eco Champion',
    description: 'Save 5kg of CO₂ emissions',
    icon: '🏆',
    earned: false
  },
  {
    id: 'frequent_traveler',
    name: 'Frequent Traveler',
    description: 'Complete 10 journeys',
    icon: '🚴',
    earned: false
  },
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Complete 50 sustainable journeys',
    icon: '⭐',
    earned: false
  }
];

export function getBadgesWithStatus(earnedBadgeIds: string[]): Badge[] {
  return AVAILABLE_BADGES.map(badge => ({
    ...badge,
    earned: earnedBadgeIds.includes(badge.id)
  }));
}
