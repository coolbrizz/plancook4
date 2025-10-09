import { Pressable, StyleSheet, Text, View } from "react-native";

type ButtonProps = {
  onPress: () => void;
  title: string;
  variant?: "primary" | "text";
  icon?: React.ReactNode;
};

export function Button({
  onPress,
  title,
  variant = "primary",
  icon,
}: ButtonProps) {
  const backgroundColor = variant === "primary" ? "#FF6B6B" : "transparent";
  const textColor = variant === "primary" ? "#FFFFFF" : "#FFFFFF";

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor },
        variant === "text" && styles.textButton,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {icon}
        {title && (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textButton: {
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
