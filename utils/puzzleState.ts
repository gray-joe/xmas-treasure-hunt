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

export async function isPuzzleUnlocked(puzzleNumber: 1 | 2 | 3 | 4 | 5): Promise<boolean> {
  if (puzzleNumber === 1) {
    return true;
  }
  
  const previousPuzzle = puzzleNumber - 1;
  return await isPuzzleCompleted(previousPuzzle as 1 | 2 | 3 | 4);
}

