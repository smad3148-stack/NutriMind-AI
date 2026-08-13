import { describe, it, expect } from 'vitest';
import foodDatabase from '../src/food_database.json';

/** Validates the food database JSON against the structural contract that
 * server.ts depends on (keys, portion sizes, numeric fields). */

const REQUIRED_KEYS = [
  'maggi', 'paneer', 'thali', 'biryani', 'butter_chicken',
  'pizza', 'burger', 'sushi', 'rasgulla',
];

const PORTION_SIZES = ['Small', 'Medium', 'Large'] as const;

describe('src/food_database.json', () => {
  it('contains every key referenced by server.ts confidence logic', () => {
    for (const key of REQUIRED_KEYS) {
      expect(foodDatabase).toHaveProperty(key);
    }
  });

  it('each item has name, category, and all three portions', () => {
    for (const [key, item] of Object.entries(foodDatabase)) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.category).toBe('string');
      for (const size of PORTION_SIZES) {
        expect(item.portions).toHaveProperty(size);
      }
    }
  });

  it('each portion has label and numeric nutrition fields', () => {
    for (const item of Object.values(foodDatabase)) {
      for (const size of PORTION_SIZES) {
        const p = item.portions[size];
        expect(typeof p.label).toBe('string');
        expect(typeof p.calories).toBe('number');
        expect(typeof p.protein).toBe('number');
        expect(typeof p.carbs).toBe('number');
        expect(typeof p.fat).toBe('number');
      }
    }
  });

  it('portion label matches its size identifier', () => {
    for (const item of Object.values(foodDatabase)) {
      for (const size of PORTION_SIZES) {
        expect(item.portions[size].label).toBe(size);
      }
    }
  });

  it('calories are positive and increase with portion size', () => {
    for (const item of Object.values(foodDatabase)) {
      const s = item.portions.Small.calories;
      const m = item.portions.Medium.calories;
      const l = item.portions.Large.calories;
      expect(s).toBeGreaterThan(0);
      expect(l).toBeGreaterThanOrEqual(m);
      expect(m).toBeGreaterThanOrEqual(s);
    }
  });
});
