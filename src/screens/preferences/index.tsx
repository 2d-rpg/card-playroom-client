import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PreferencesScreen({
  navigation,
}: {
  navigation: PreferencesScreenNavigationProp;
}): ReactElement {
  const [endpoint, setEndpoint] = useState("127.0.0.1");
  useEffect(() => {
    (async () => {
      try {
        const endpointFromPreferences = await AsyncStorage.getItem("@endpoint");
        if (endpointFromPreferences != null) {
          setEndpoint(endpointFromPreferences);
        }
      } catch (error) {
        // 設定読み込みエラー
        console.log(error);
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("@endpoint", endpoint);
      } catch (error) {
        // 設定保存エラー
        console.log(error);
      }
    })();
  }, [endpoint]);
  return (
    <View style={styles.container}>
      <Text>Setting Screen</Text>
      <Text>サーバーアドレス</Text>
      <TextInput
        style={{
          width: "50%",
          borderWidth: 1,
          borderColor: "#ccc",
        }}
        onChangeText={(input) => setEndpoint(input)}
        value={endpoint}
      />
      <StatusBar style="auto" />
    </View>
  );
}

type PreferencesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Preferences"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
