import { incrementPuzzleGuessCount, isPuzzleUnlocked, PUZZLE_STORAGE_KEYS } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORAGE_KEY = PUZZLE_STORAGE_KEYS.puzzle4;
const QUESTION = "Complete the sequence";
const CORRECT_ANSWER = "Mistletoe";

const WORD_LIST = [
  { index: 1, word: "Igloo" },
  { index: 2, word: "Vixen" },
  { index: 3, word: "Xmas" },
  { index: 4, word: "Lapland" },
  { index: 5, word: "Crackers" },
  { index: 6, word: "Decorations" },
  { index: 7, word: null },
];

const MULTIPLE_CHOICE_OPTIONS = [
  { letter: "A", answer: "Igloo" },
  { letter: "B", answer: "Dasher" },
  { letter: "C", answer: "Mistletoe" },
  { letter: "D", answer: "Turkey" },
  { letter: "E", answer: "Presents" },
];

export default function Puzzle4Screen() {
  const insets = useSafeAreaInsets();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
    const unlocked = await isPuzzleUnlocked(4);
    setIsUnlocked(unlocked);
  };

  const loadCompletionState = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === "true") {
        setIsCompleted(true);
        setSelectedAnswer(CORRECT_ANSWER);
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  const handleOptionSelect = (answer: string) => {
    if (isCompleted) return;
    setSelectedAnswer(answer);
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setMessage("Please select an answer");
      setMessageType("error");
      return;
    }

    await incrementPuzzleGuessCount(4);

    if (selectedAnswer.toLowerCase() === CORRECT_ANSWER.toLowerCase()) {
      setIsCompleted(true);
      setMessage("Correct! Puzzle 4 completed!");
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
      <View style={styles.lockedContainer}>
        <Ionicons name="lock-closed" size={64} color="#cccccc" />
        <Text style={styles.lockedTitle}>Puzzle 4 is Locked</Text>
        <Text style={styles.lockedText}>
          Complete Puzzle 3 to unlock this puzzle
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top, 20) }]}
      style={styles.container}
    >
      <Text style={styles.title}>Puzzle 4</Text>
      <Text style={styles.question}>{QUESTION}</Text>
      
      {isCompleted && (
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓ Completed</Text>
        </View>
      )}

      <View style={styles.wordListContainer}>
        {WORD_LIST.map((item) => (
          <View key={item.index} style={styles.wordRow}>
            <Text style={styles.wordNumber}>{item.index}.</Text>
            {item.word ? (
              <Text style={styles.wordText}>{item.word}</Text>
            ) : (
              <View style={styles.multipleChoiceContainer}>
                {MULTIPLE_CHOICE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.letter}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option.answer && styles.optionButtonSelected,
                      isCompleted && selectedAnswer === option.answer && option.answer === CORRECT_ANSWER && styles.optionButtonCorrect,
                      isCompleted && styles.optionButtonDisabled,
                    ]}
                    onPress={() => handleOptionSelect(option.answer)}
                    disabled={isCompleted}
                  >
                    <Text style={[
                      styles.optionLetter,
                      selectedAnswer === option.answer && styles.optionLetterSelected,
                    ]}>
                      {option.letter}.
                    </Text>
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === option.answer && styles.optionTextSelected,
                    ]}>
                      {option.answer}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
        disabled={isCompleted || !selectedAnswer}
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
  lockedContainer: {
    flex: 1,
    backgroundColor: "#1a4d2e",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  question: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
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
  wordListContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
    paddingRight: 20,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  wordNumber: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
    marginRight: 10,
  },
  wordText: {
    color: "#ffffff",
    fontSize: 18,
    flex: 1,
  },
  multipleChoiceContainer: {
    flex: 1,
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  optionButtonSelected: {
    backgroundColor: "#3d6a4d",
    borderColor: "#FFD700",
  },
  optionButtonCorrect: {
    backgroundColor: "#2d5a3d",
    borderColor: "#FFD700",
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionLetter: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    minWidth: 20,
  },
  optionLetterSelected: {
    color: "#ffffff",
  },
  optionText: {
    color: "#ffffff",
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
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
    marginBottom: 20,
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

