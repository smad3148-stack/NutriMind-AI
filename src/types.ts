/**
 * NutriMind-AI shared client/server types.
 *
 * Kept dependency-free so it can be imported by both the Express server
 * (`server.ts`) and the browser bundle built by Vite.
 */

/** A single chat message exchanged with the NutriMind AI coach. */
export interface ChatMessage {
  /** Stable client/server generated id (e.g. `msg_<id>`). */
  id: string;
  /** Who authored the message. */
  sender: 'user' | 'assistant';
  /** Rendered message text. */
  text: string;
  /** ISO-8601 timestamp string. */
  timestamp: string;
  /** Optional structured attachment (food scan result, chart, etc.). */
  attachment?: any;
}

/** Nutritional snapshot for one serving size of a food entry. */
export interface FoodPortion {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** A food item keyed by its snake_case identifier in the food database. */
export interface FoodItem {
  name: string;
  category: string;
  portions: {
    Small: FoodPortion;
    Medium: FoodPortion;
    Large: FoodPortion;
  };
}

/** The in-repo food database, keyed by snake_case food identifier. */
export type FoodDatabase = Record<string, FoodItem>;
