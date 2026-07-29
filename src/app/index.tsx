import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.centerText}>Welcome to, THE Last Glance App!</Text>
      <Text style={{
        color: "white",
        backgroundColor: "red",
        fontSize: 30,
        marginTop: 10,
        borderRadius: 20,
        padding: 8
      }}>Siuuuuuu</Text>
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
    color: "white",
    fontSize: 25,
    textAlign: "center"
  }
});
