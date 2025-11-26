import { incrementPuzzleGuessCount, isPuzzleUnlocked, PUZZLE_STORAGE_KEYS } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const CORRECT_ANSWER = "Goat";
const STORAGE_KEY = PUZZLE_STORAGE_KEYS.puzzle2;
const QUESTION = "If we eat Fish on St.David's Day, Crab on US Independence Day, and Beef on St George's Day, what do we eat on Christmas Day?";

export default function Puzzle2Screen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

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
    const unlocked = await isPuzzleUnlocked(2);
    setIsUnlocked(unlocked);
  };

  const loadCompletionState = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === "true") {
        setIsCompleted(true);
        setInput(CORRECT_ANSWER);
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      setMessage("Please enter an answer");
      setMessageType("error");
      return;
    }

    await incrementPuzzleGuessCount(2);

    if (trimmedInput.toLowerCase() === CORRECT_ANSWER.toLowerCase()) {
      setIsCompleted(true);
      setMessage("Correct! Puzzle 2 completed!");
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
        <Ionicons name="lock-closed" size={64} color="#cccccc" />
        <Text style={styles.lockedTitle}>Puzzle 2 is Locked</Text>
        <Text style={styles.lockedText}>
          Complete Puzzle 1 to unlock this puzzle
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle 2</Text>
      
      {isCompleted && (
        <>
          <View style={styles.successBadge}>
            <Text style={styles.successText}>✓ Completed</Text>
          </View>
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            <Text style={styles.answerText}>{CORRECT_ANSWER}</Text>
          </View>
        </>
      )}

      <Text style={styles.question}>{QUESTION}</Text>

      <TextInput
        style={[
          styles.input,
          isCompleted && styles.inputDisabled,
        ]}
        value={input}
        onChangeText={setInput}
        placeholder="Enter your answer..."
        placeholderTextColor="#cccccc"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isCompleted}
      />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  successBadge: {
    backgroundColor: "#FFD700",
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
  answerContainer: {
    backgroundColor: "#2d5a3d",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
    minWidth: 200,
    alignItems: "center",
  },
  answerLabel: {
    color: "#cccccc",
    fontSize: 14,
    marginBottom: 5,
  },
  answerText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  question: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 26,
  },
  input: {
    width: "100%",
    maxWidth: 300,
    height: 50,
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 15,
  },
  inputDisabled: {
    opacity: 0.6,
    borderColor: "#cccccc",
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  successMessage: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#DC143C",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  buttonText: {
    color: "#1a4d2e",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  lockedTitle: {
    color: "#cccccc",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  lockedText: {
    color: "#cccccc",
    fontSize: 16,
    textAlign: "center",
  },
});

