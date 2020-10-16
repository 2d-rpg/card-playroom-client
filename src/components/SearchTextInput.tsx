import React, { ReactElement, useState } from "react";
import { TextInput, StyleSheet } from "react-native";

export default function SearchTextInput(): ReactElement {
  const [value, onChangeText] = useState("");

  return (
    <TextInput
      style={styles.input}
      onChangeText={(text) => onChangeText(text)}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "gray",
    height: 40,
    width: 100,
  },
});
