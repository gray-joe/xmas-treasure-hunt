import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const SNOWFLAKE_COUNT = 30;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Snowflake {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  rotation: Animated.Value;
  initialX: number;
  driftRange: number;
}

export default function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const newSnowflakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }, () => {
      const initialX = Math.random() * SCREEN_WIDTH;
      const initialY = -50 - Math.random() * 100;
      return {
        x: new Animated.Value(initialX),
        y: new Animated.Value(initialY),
        opacity: new Animated.Value(0.3 + Math.random() * 0.4),
        size: 8 + Math.random() * 12,
        rotation: new Animated.Value(0),
        initialX,
        driftRange: 30 + Math.random() * 40,
      };
    });

    setSnowflakes(newSnowflakes);

    const newAnimations: Animated.CompositeAnimation[] = [];

    newSnowflakes.forEach((snowflake) => {
      const fallAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(snowflake.y, {
            toValue: SCREEN_HEIGHT + 100,
            duration: 5000 + Math.random() * 5000,
            useNativeDriver: false,
          }),
          Animated.timing(snowflake.y, {
            toValue: -50,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );

      const driftAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(snowflake.x, {
            toValue: snowflake.initialX + snowflake.driftRange,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
          Animated.timing(snowflake.x, {
            toValue: snowflake.initialX - snowflake.driftRange,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
          Animated.timing(snowflake.x, {
            toValue: snowflake.initialX,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
        ])
      );

      const rotateAnimation = Animated.loop(
        Animated.timing(snowflake.rotation, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: false,
        })
      );

      fallAnimation.start();
      driftAnimation.start();
      rotateAnimation.start();

      newAnimations.push(fallAnimation, driftAnimation, rotateAnimation);
    });

    animationsRef.current = newAnimations;

    return () => {
      animationsRef.current.forEach((animation) => {
        animation.stop();
      });
    };
  }, []);

  const renderSnowflake = (snowflake: Snowflake, index: number) => {
    const rotate = snowflake.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.snowflake,
          {
            left: snowflake.x,
            top: snowflake.y,
            opacity: snowflake.opacity,
            width: snowflake.size,
            height: snowflake.size,
            transform: [{ rotate }],
          },
        ]}
      >
        <View style={[styles.snowflakeShape, { width: snowflake.size, height: snowflake.size }]} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((snowflake, index) => renderSnowflake(snowflake, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  snowflake: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  snowflakeShape: {
    backgroundColor: "#ffffff",
    borderRadius: 50,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

