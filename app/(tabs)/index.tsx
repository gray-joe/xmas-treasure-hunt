import { getPuzzleGuessCount, isPuzzleCompleted, isPuzzleUnlocked } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [puzzleStatuses, setPuzzleStatuses] = useState<{
    unlocked: boolean;
    completed: boolean;
    guesses: number;
  }[]>([]);

  useEffect(() => {
    loadStatuses();
    const interval = setInterval(loadStatuses, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStatuses = async () => {
    const statuses = [];
    for (let i = 1; i <= 5; i++) {
      const unlocked = await isPuzzleUnlocked(i as 1 | 2 | 3 | 4 | 5);
      const completed = await isPuzzleCompleted(i as 1 | 2 | 3 | 4 | 5);
      const guesses = await getPuzzleGuessCount(i as 1 | 2 | 3 | 4 | 5);
      statuses.push({ unlocked, completed, guesses });
    }
    setPuzzleStatuses(statuses);
  };

  const handlePuzzlePress = (puzzleNum: number) => {
    if (puzzleStatuses[puzzleNum - 1]?.unlocked) {
      router.push(`/(tabs)/puzzle${puzzleNum}`);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingTop: Math.max(insets.top, 20) },
      ]}
      style={styles.container}
    >
      <Text style={styles.title}>Christmas Treasure Hunt</Text>
      <Text style={styles.subtitle}>Puzzle Status</Text>

      <View style={styles.puzzlesContainer}>
        {[1, 2, 3, 4, 5].map((puzzleNum) => {
          const status = puzzleStatuses[puzzleNum - 1];
          const unlocked = status?.unlocked ?? false;
          const completed = status?.completed ?? false;
          const guesses = status?.guesses ?? 0;

          return (
            <TouchableOpacity
              key={puzzleNum}
              style={[
                styles.puzzleCard,
                !unlocked && styles.puzzleCardLocked,
                completed && styles.puzzleCardCompleted,
              ]}
              onPress={() => handlePuzzlePress(puzzleNum)}
              disabled={!unlocked}
            >
              <View style={styles.puzzleHeader}>
                <Ionicons
                  name={
                    completed
                      ? "checkmark-circle"
                      : unlocked
                      ? "extension-puzzle"
                      : "lock-closed"
                  }
                  size={32}
                  color={
                    completed
                      ? "#90ee90"
                      : unlocked
                      ? "#90ee90"
                      : "#6b8e6b"
                  }
                />
                <View>
                  <Text style={styles.puzzleNumber}>Puzzle {puzzleNum}</Text>
                  {unlocked && guesses > 0 && (
                    <Text style={styles.guessCount}>
                      {guesses} {guesses === 1 ? "guess" : "guesses"}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.puzzleStatus}>
                {completed ? (
                  <Text style={styles.statusTextCompleted}>✓ Completed</Text>
                ) : unlocked ? (
                  <Text style={styles.statusTextUnlocked}>In Progress</Text>
                ) : (
                  <Text style={styles.statusTextLocked}>Locked</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#6b8e6b",
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
  },
  puzzlesContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 15,
  },
  puzzleCard: {
    backgroundColor: "#2d5a3d",
    borderWidth: 2,
    borderColor: "#90ee90",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  puzzleCardLocked: {
    borderColor: "#6b8e6b",
    opacity: 0.6,
  },
  puzzleCardCompleted: {
    borderColor: "#90ee90",
    backgroundColor: "#2d5a3d",
  },
  puzzleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  puzzleNumber: {
    color: "#90ee90",
    fontSize: 20,
    fontWeight: "bold",
  },
  guessCount: {
    color: "#6b8e6b",
    fontSize: 14,
    marginTop: 2,
  },
  puzzleStatus: {
    alignItems: "flex-end",
  },
  statusTextCompleted: {
    color: "#90ee90",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusTextUnlocked: {
    color: "#90ee90",
    fontSize: 16,
  },
  statusTextLocked: {
    color: "#6b8e6b",
    fontSize: 16,
  },
});

