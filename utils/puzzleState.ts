import AsyncStorage from "@react-native-async-storage/async-storage";

export const PUZZLE_STORAGE_KEYS = {
  puzzle1: "puzzle1_completed",
  puzzle2: "puzzle2_completed",
  puzzle3: "puzzle3_completed",
  puzzle4: "puzzle4_completed",
  puzzle5: "puzzle5_completed",
} as const;

export const PUZZLE_GUESS_KEYS = {
  puzzle1: "puzzle1_guesses",
  puzzle2: "puzzle2_guesses",
  puzzle3: "puzzle3_guesses",
  puzzle4: "puzzle4_guesses",
  puzzle5: "puzzle5_guesses",
} as const;

export async function getPuzzleGuessCount(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<number> {
  try {
    const key = PUZZLE_GUESS_KEYS[`puzzle${puzzleNumber}` as keyof typeof PUZZLE_GUESS_KEYS];
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error(`Error getting puzzle ${puzzleNumber} guess count:`, error);
    return 0;
  }
}

export async function incrementPuzzleGuessCount(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<number> {
  try {
    const key = PUZZLE_GUESS_KEYS[`puzzle${puzzleNumber}` as keyof typeof PUZZLE_GUESS_KEYS];
    const currentCount = await getPuzzleGuessCount(puzzleNumber);
    const newCount = currentCount + 1;
    await AsyncStorage.setItem(key, newCount.toString());
    return newCount;
  } catch (error) {
    console.error(`Error incrementing puzzle ${puzzleNumber} guess count:`, error);
    return 0;
  }
}

export async function isPuzzleCompleted(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<boolean> {
  try {
    const key = PUZZLE_STORAGE_KEYS[`puzzle${puzzleNumber}` as keyof typeof PUZZLE_STORAGE_KEYS];
    const completed = await AsyncStorage.getItem(key);
    return completed === "true";
  } catch (error) {
    console.error(`Error checking puzzle ${puzzleNumber} completion:`, error);
    return false;
  }
}

export const PUZZLE_UNLOCK_DATES: Record<number, Date> = {
  1: new Date(2025, 11, 1),
  2: new Date(2025, 11, 2),
  3: new Date(2025, 11, 3),
  4: new Date(2025, 11, 4),
  5: new Date(2025, 11, 5),
};

function isDateUnlocked(unlockDate: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const unlock = new Date(unlockDate);
  unlock.setHours(0, 0, 0, 0);
  return now >= unlock;
}

export function getPuzzleUnlockDate(puzzleNumber: 1 | 2 | 3 | 4 | 5): Date {
  return PUZZLE_UNLOCK_DATES[puzzleNumber];
}

export async function getPuzzleLockReason(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<"date" | "completion" | null> {
  const unlockDate = PUZZLE_UNLOCK_DATES[puzzleNumber];
  const dateUnlocked = isDateUnlocked(unlockDate);
  
  if (!dateUnlocked) {
    return "date";
  }

  if (puzzleNumber === 1) {
    return null;
  }

  const previousPuzzle = puzzleNumber - 1;
  const isPreviousCompleted = await isPuzzleCompleted(previousPuzzle as 1 | 2 | 3 | 4);
  
  if (!isPreviousCompleted) {
    return "completion";
  }

  return null;
}

export async function isPuzzleUnlocked(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<boolean> {
  const unlockDate = PUZZLE_UNLOCK_DATES[puzzleNumber];
  
  if (!isDateUnlocked(unlockDate)) {
    return false;
  }

  if (puzzleNumber === 1) {
    return true;
  }
  
  const previousPuzzle = puzzleNumber - 1;
  return await isPuzzleCompleted(previousPuzzle as 1 | 2 | 3 | 4);
}

