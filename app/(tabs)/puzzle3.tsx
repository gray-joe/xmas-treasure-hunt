import { incrementPuzzleGuessCount, isPuzzleUnlocked, PUZZLE_STORAGE_KEYS } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORAGE_KEY = PUZZLE_STORAGE_KEYS.puzzle3;
const QUESTION = "Complete the sequence";
const CORRECT_ANSWER_4 = "Islamabad";

const CAPITAL_CITIES_STARTING_WITH_M = [
  "Madrid",
  "Majuro",
  "Malabo",
  "Male",
  "Managua",
  "Manama",
  "Manila",
  "Maputo",
  "Mariehamn",
  "Marigot",
  "Maseru",
  "Mata-Utu",
  "Mexico City",
  "Minsk",
  "Mogadishu",
  "Monaco",
  "Monrovia",
  "Montevideo",
  "Moroni",
  "Moscow",
  "Muscat",
];

const WORD_LIST = [
  { index: 1, word: "Cairo" },
  { index: 2, word: "Helsinki" },
  { index: 3, word: "Reykjavik" },
  { index: 4, word: null },
  { index: 5, word: "Sofia" },
  { index: 6, word: "Tokyo" },
  { index: 7, word: null },
  { index: 8, word: "Ankara" },
  { index: 9, word: "Seoul" },
];

export default function Puzzle3Screen() {
  const insets = useSafeAreaInsets();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answer4, setAnswer4] = useState("");
  const [answer7, setAnswer7] = useState("");
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
    const unlocked = await isPuzzleUnlocked(3);
    setIsUnlocked(unlocked);
  };

  const loadCompletionState = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === "true") {
        setIsCompleted(true);
        const savedAnswers = await AsyncStorage.getItem(`${STORAGE_KEY}_answers`);
        if (savedAnswers) {
          const [ans4, ans7] = savedAnswers.split("|");
          setAnswer4(ans4 || "");
          setAnswer7(ans7 || "");
        }
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  const handleSubmit = async () => {
    const trimmed4 = answer4.trim();
    const trimmed7 = answer7.trim();
    
    if (!trimmed4 || !trimmed7) {
      setMessage("Please fill in both missing words");
      setMessageType("error");
      return;
    }

    await incrementPuzzleGuessCount(3);

    const isCorrect4 = trimmed4.toLowerCase() === CORRECT_ANSWER_4.toLowerCase();
    const isCorrect7 = CAPITAL_CITIES_STARTING_WITH_M.some(
      city => city.toLowerCase() === trimmed7.toLowerCase()
    );
    
    if (isCorrect4 && isCorrect7) {
      setIsCompleted(true);
      setMessage("Correct! Puzzle 3 completed!");
      setMessageType("success");
      
      try {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        await AsyncStorage.setItem(`${STORAGE_KEY}_answers`, `${trimmed4}|${trimmed7}`);
      } catch (error) {
        console.error("Error saving state:", error);
      }
    } else {
      if (!isCorrect4 && !isCorrect7) {
        setMessage("Both answers are incorrect. Try again!");
      } else if (!isCorrect4) {
        setMessage("The first answer is incorrect. Try again!");
      } else {
        setMessage("The second answer must be a capital city starting with 'M'. Try again!");
      }
      setMessageType("error");
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.lockedContainer}>
        <Ionicons name="lock-closed" size={64} color="#cccccc" />
        <Text style={styles.lockedTitle}>Puzzle 3 is Locked</Text>
        <Text style={styles.lockedText}>
          Complete Puzzle 2 to unlock this puzzle
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top, 20) }]}
      style={styles.container}
    >
      <Text style={styles.title}>Puzzle 3</Text>
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
              <TextInput
                style={[
                  styles.wordInput,
                  isCompleted && styles.inputDisabled,
                ]}
                value={item.index === 4 ? answer4 : answer7}
                onChangeText={(text) => {
                  if (item.index === 4) {
                    setAnswer4(text);
                  } else {
                    setAnswer7(text);
                  }
                  if (message) {
                    setMessage("");
                    setMessageType("");
                  }
                }}
                placeholder="Enter word..."
                placeholderTextColor="#cccccc"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isCompleted}
              />
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
  wordInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#ffffff",
    fontSize: 18,
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

