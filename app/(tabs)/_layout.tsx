import { isPuzzleUnlocked } from "@/utils/puzzleState";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const [unlockedPuzzles, setUnlockedPuzzles] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    const checkUnlocked = async () => {
      const unlocked = new Set<number>();
      for (let i = 1; i <= 5; i++) {
        if (await isPuzzleUnlocked(i as 1 | 2 | 3 | 4 | 5)) {
          unlocked.add(i);
        }
      }
      setUnlockedPuzzles(unlocked);
    };

    checkUnlocked();

    const interval = setInterval(checkUnlocked, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabIcon = (puzzleNum: number, color: string, size: number) => {
    const isUnlocked = unlockedPuzzles.has(puzzleNum);
    return (
      <Ionicons
        name={isUnlocked ? "extension-puzzle" : "lock-closed"}
        size={size}
        color={color}
      />
    );
  };

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a4d2e",
          borderTopColor: "#2d5a3d",
        },
        tabBarActiveTintColor: "#FFD700",
        tabBarInactiveTintColor: "#cccccc",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="puzzle1"
        options={{
          title: "Puzzle 1",
          tabBarIcon: ({ color, size }) => getTabIcon(1, color, size),
        }}
      />
      <Tabs.Screen
        name="puzzle2"
        options={{
          title: "Puzzle 2",
          tabBarIcon: ({ color, size }) => {
            const isUnlocked = unlockedPuzzles.has(2);
            return getTabIcon(2, isUnlocked ? color : "#cccccc", size);
          },
          tabBarItemStyle: unlockedPuzzles.has(2) ? undefined : { opacity: 0.5 },
        }}
      />
      <Tabs.Screen
        name="puzzle3"
        options={{
          title: "Puzzle 3",
          tabBarIcon: ({ color, size }) => {
            const isUnlocked = unlockedPuzzles.has(3);
            return getTabIcon(3, isUnlocked ? color : "#cccccc", size);
          },
          tabBarItemStyle: unlockedPuzzles.has(3) ? undefined : { opacity: 0.5 },
        }}
      />
      <Tabs.Screen
        name="puzzle4"
        options={{
          title: "Puzzle 4",
          tabBarIcon: ({ color, size }) => {
            const isUnlocked = unlockedPuzzles.has(4);
            return getTabIcon(4, isUnlocked ? color : "#cccccc", size);
          },
          tabBarItemStyle: unlockedPuzzles.has(4) ? undefined : { opacity: 0.5 },
        }}
      />
      <Tabs.Screen
        name="puzzle5"
        options={{
          title: "Puzzle 5",
          tabBarIcon: ({ color, size }) => {
            const isUnlocked = unlockedPuzzles.has(5);
            return getTabIcon(5, isUnlocked ? color : "#cccccc", size);
          },
          tabBarItemStyle: unlockedPuzzles.has(5) ? undefined : { opacity: 0.5 },
        }}
      />
    </Tabs>
  );
}
