import { incrementPuzzleGuessCount } from "@/utils/puzzleState";
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
  const [inputs, setInputs] = useState<string[]>(Array(INPUT_COUNT).fill(""));
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - (CONTAINER_PADDING * 2) - (ROW_PADDING * 2);
  
  const calculateInputWidth = (count: number) => {
    const totalGaps = (count - 1) * GAP;
    return Math.floor((availableWidth - totalGaps) / count);
  };

  const inputWidth = calculateInputWidth(9);

  useEffect(() => {
    loadCompletionState();
  }, []);

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
              placeholderTextColor="#6b8e6b"
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
              placeholderTextColor="#6b8e6b"
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
    color: "#90ee90",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  clueLabel: {
    color: "#6b8e6b",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 20,
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
  answerContainer: {
    backgroundColor: "#2d5a3d",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#90ee90",
    alignItems: "center",
  },
  answerLabel: {
    color: "#6b8e6b",
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
    borderColor: "#90ee90",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 30,
  },
  answerDigitText: {
    color: "#90ee90",
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
    borderColor: "#90ee90",
    borderRadius: 8,
    color: "#90ee90",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 0,
    minWidth: 30,
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
});

