import { getPuzzleLockReason, getPuzzleUnlockDate, incrementPuzzleGuessCount, isPuzzleUnlocked } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const CORRECT_ANSWER = "31114341111311";
const STORAGE_KEY = "puzzle1_completed";
const INPUT_COUNT = 14;

const GAP = 8;
const CONTAINER_PADDING = 20;
const ROW_PADDING = 10;

export default function Puzzle1Screen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputs, setInputs] = useState<string[]>(Array(INPUT_COUNT).fill(""));
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [lockReason, setLockReason] = useState<"date" | "completion" | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - (CONTAINER_PADDING * 2) - (ROW_PADDING * 2);
  
  const calculateInputWidth = (count: number) => {
    const totalGaps = (count - 1) * GAP;
    return Math.floor((availableWidth - totalGaps) / count);
  };

  const inputWidth = calculateInputWidth(9);

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
    const unlocked = await isPuzzleUnlocked(1);
    setIsUnlocked(unlocked);
    if (!unlocked) {
      const reason = await getPuzzleLockReason(1);
      setLockReason(reason);
    }
  };

  const loadCompletionState = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === "true") {
        setIsCompleted(true);
        setInputs(CORRECT_ANSWER.split(""));
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    if (value && index < INPUT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !inputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const combinedInput = inputs.join("");
    
    if (combinedInput.length !== INPUT_COUNT) {
      setMessage("Please fill all fields");
      setMessageType("error");
      return;
    }

    await incrementPuzzleGuessCount(1);

    if (combinedInput === CORRECT_ANSWER) {
      setIsCompleted(true);
      setMessage("Correct! Puzzle 1 completed!");
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
    const unlockDate = getPuzzleUnlockDate(1);
    const dateStr = unlockDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    
    return (
      <View style={styles.container}>
        <Ionicons name="lock-closed" size={64} color="#cccccc" />
        <Text style={styles.lockedTitle}>Puzzle 1 is Locked</Text>
        <Text style={styles.lockedText}>
          This puzzle unlocks on {dateStr}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle 1</Text>
      <Text style={styles.clueLabel}>Christmas card clue</Text>
      
      {isCompleted && (
        <>
          <View style={styles.successBadge}>
            <Text style={styles.successText}>✓ Completed</Text>
          </View>
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            <View style={styles.answerInputsContainer}>
              <View style={styles.answerRow}>
                {CORRECT_ANSWER.split("").slice(0, 5).map((digit, index) => (
                  <View key={index} style={[styles.answerDigitBox, { width: inputWidth }]}>
                    <Text style={styles.answerDigitText}>{digit}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.answerRow}>
                {CORRECT_ANSWER.split("").slice(5, 14).map((digit, index) => (
                  <View key={index + 5} style={[styles.answerDigitBox, { width: inputWidth }]}>
                    <Text style={styles.answerDigitText}>{digit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          {inputs.slice(0, 5).map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.digitInput,
                { width: inputWidth },
                isCompleted && styles.inputDisabled,
              ]}
              value={value}
              onChangeText={(text) => handleInputChange(index, text)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              placeholder=""
              placeholderTextColor="#cccccc"
              keyboardType="number-pad"
              maxLength={1}
              editable={!isCompleted}
              selectTextOnFocus
            />
          ))}
        </View>
        <View style={styles.inputRow}>
          {inputs.slice(5, 14).map((value, index) => (
            <TextInput
              key={index + 5}
              ref={(ref) => {
                inputRefs.current[index + 5] = ref;
              }}
              style={[
                styles.digitInput,
                { width: inputWidth },
                isCompleted && styles.inputDisabled,
              ]}
              value={value}
              onChangeText={(text) => handleInputChange(index + 5, text)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index + 5, nativeEvent.key)}
              placeholder=""
              placeholderTextColor="#cccccc"
              keyboardType="number-pad"
              maxLength={1}
              editable={!isCompleted}
              selectTextOnFocus
            />
          ))}
        </View>
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
    marginBottom: 10,
  },
  clueLabel: {
    color: "#cccccc",
    fontSize: 16,
    fontStyle: "italic",
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
    alignItems: "center",
  },
  answerLabel: {
    color: "#cccccc",
    fontSize: 14,
    marginBottom: 10,
  },
  answerInputsContainer: {
    alignItems: "center",
    width: "100%",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: GAP,
    marginBottom: 8,
    paddingHorizontal: ROW_PADDING,
  },
  answerDigitBox: {
    height: 50,
    backgroundColor: "#1a4d2e",
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 30,
  },
  answerDigitText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  inputsContainer: {
    marginBottom: 20,
    paddingHorizontal: ROW_PADDING,
    width: "100%",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: GAP,
    marginBottom: 8,
    paddingHorizontal: ROW_PADDING,
  },
  digitInput: {
    height: 50,
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 8,
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 0,
    minWidth: 30,
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

