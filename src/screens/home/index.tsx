import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_ENDPOINT = "127.0.0.1";
export default function HomeScreen(): ReactElement {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
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
  // TODO サーバーと接続できているか確認するボタンの実装
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
