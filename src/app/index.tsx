import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.centerText}>Welcome to Last Glance App!, hehe </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0e0e0e",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    color: "white"
  }
});
