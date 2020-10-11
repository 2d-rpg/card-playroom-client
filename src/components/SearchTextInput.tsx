import React, { ReactElement, useState } from "react";
import { TextInput } from "react-native";

export default function SearchTextInput(): ReactElement {
  const [value, onChangeText] = useState("ルーム検索...");

  return (
    <TextInput
      style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
      onChangeText={(text) => onChangeText(text)}
      value={value}
    />
  );
}
