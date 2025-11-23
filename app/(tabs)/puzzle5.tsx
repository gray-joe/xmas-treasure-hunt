import { incrementPuzzleGuessCount, isPuzzleUnlocked, PUZZLE_STORAGE_KEYS } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORAGE_KEY = PUZZLE_STORAGE_KEYS.puzzle5;
const QUESTION = "Complete the true 5x5 word square";
const HINT = "A true word square is one that read the same horizontally as it does vertically";

const CLUES = [
  "Father Christmas",
  "To anticipate an event",
  "Relating to the nose",
  "Diadem",
  "Book of maps",
];

const CORRECT_GRID = [
  ["S", "A", "N", "T", "A"],
  ["A", "W", "A", "I", "T"],
  ["N", "A", "S", "A", "L"],
  ["T", "I", "A", "R", "A"],
  ["A", "T", "L", "A", "S"],
];

const GRID_SIZE = 5;

export default function Puzzle5Screen() {
  const insets = useSafeAreaInsets();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [grid, setGrid] = useState<string[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""))
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const inputRefs = useRef<(TextInput | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadCompletionState();
    }
  }, [isUnlocked]);

  const checkStatus = async () => {
    const unlocked = await isPuzzleUnlocked(5);
    setIsUnlocked(unlocked);
  };

  const loadCompletionState = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === "true") {
        setIsCompleted(true);
        setGrid(CORRECT_GRID.map(row => [...row]));
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1).toUpperCase();
    }
    
    if (value && !/^[A-Z]$/.test(value)) {
      return;
    }

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value;
    setGrid(newGrid);

    if (value && col < GRID_SIZE - 1) {
      inputRefs.current[row][col + 1]?.focus();
    } else if (value && col === GRID_SIZE - 1 && row < GRID_SIZE - 1) {
      inputRefs.current[row + 1][0]?.focus();
    }

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleKeyPress = (row: number, col: number, key: string) => {
    if (key === "Backspace" && !grid[row][col]) {
      if (col > 0) {
        inputRefs.current[row][col - 1]?.focus();
      } else if (row > 0) {
        inputRefs.current[row - 1][GRID_SIZE - 1]?.focus();
      }
    }
  };

  const validateWordSquare = (g: string[][]): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = g[i].join("");
      const col = g.map(r => r[i]).join("");
      if (row !== col || row.length !== GRID_SIZE) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const isComplete = grid.every(row => row.every(cell => cell !== ""));
    
    if (!isComplete) {
      setMessage("Please fill all cells");
      setMessageType("error");
      return;
    }

    await incrementPuzzleGuessCount(5);

    const isCorrect = JSON.stringify(grid) === JSON.stringify(CORRECT_GRID);
    const isValidSquare = validateWordSquare(grid);

    if (isCorrect && isValidSquare) {
      setIsCompleted(true);
      setMessage("Correct! Puzzle 5 completed!");
      setMessageType("success");
      
      try {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
      } catch (error) {
        console.error("Error saving state:", error);
      }
    } else {
      setMessage("Incorrect answer. Try again!");
      setMessageType("error");
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.container}>
        <Ionicons name="lock-closed" size={64} color="#6b8e6b" />
        <Text style={styles.lockedTitle}>Puzzle 5 is Locked</Text>
        <Text style={styles.lockedText}>
          Complete Puzzle 4 to unlock this puzzle
        </Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - 80;
  const cellSize = Math.floor((availableWidth - (GRID_SIZE - 1) * 8) / GRID_SIZE);

  return (
    <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top, 20) }]}
      style={styles.container}
    >
      <Text style={styles.title}>Puzzle 5</Text>
      <Text style={styles.question}>{QUESTION}</Text>
      <Text style={styles.hint}>{HINT}</Text>
      
      {isCompleted && (
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓ Completed</Text>
        </View>
      )}

      <View style={styles.cluesContainer}>
        {CLUES.map((clue, index) => (
          <View key={index} style={styles.clueRow}>
            <Text style={styles.clueNumber}>{index + 1}.</Text>
            <Text style={styles.clueText}>{clue}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((cell, colIndex) => (
              <TextInput
                key={`${rowIndex}-${colIndex}`}
                ref={(ref) => {
                  inputRefs.current[rowIndex][colIndex] = ref;
                }}
                style={[
                  styles.gridCell,
                  { width: cellSize, height: cellSize },
                  isCompleted && styles.inputDisabled,
                ]}
                value={cell}
                onChangeText={(text) => handleInputChange(rowIndex, colIndex, text)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(rowIndex, colIndex, nativeEvent.key)}
                placeholder=""
                keyboardType="default"
                autoCapitalize="characters"
                maxLength={1}
                editable={!isCompleted}
                selectTextOnFocus
              />
            ))}
          </View>
        ))}
      </View>

      {message && (
        <Text style={[
          styles.message,
          messageType === "success" ? styles.successMessage : styles.errorMessage,
        ]}>
          {message}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          isCompleted && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isCompleted}
      >
        <Text style={styles.buttonText}>
          {isCompleted ? "Completed" : "Submit"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    color: "#90ee90",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  question: {
    color: "#90ee90",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  hint: {
    color: "#6b8e6b",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  successBadge: {
    backgroundColor: "#90ee90",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  successText: {
    color: "#1a4d2e",
    fontSize: 16,
    fontWeight: "bold",
  },
  cluesContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  clueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clueNumber: {
    color: "#90ee90",
    fontSize: 16,
    fontWeight: "bold",
    width: 25,
    marginRight: 10,
  },
  clueText: {
    color: "#90ee90",
    fontSize: 16,
    flex: 1,
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  gridCell: {
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#90ee90",
    borderRadius: 8,
    color: "#90ee90",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 8,
    padding: 0,
  },
  inputDisabled: {
    opacity: 0.6,
    borderColor: "#6b8e6b",
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  successMessage: {
    color: "#90ee90",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#ff6b6b",
  },
  button: {
    backgroundColor: "#90ee90",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#6b8e6b",
    opacity: 0.7,
  },
  buttonText: {
    color: "#1a4d2e",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  lockedTitle: {
    color: "#6b8e6b",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  lockedText: {
    color: "#6b8e6b",
    fontSize: 16,
    textAlign: "center",
  },
});

