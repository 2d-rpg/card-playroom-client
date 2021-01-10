import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "react-native-elements";

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
  // TODO ユーザーに関する情報（ユーザーアイコン，ユーザーネーム）の実装
  return (
    <View style={styles.container}>
      <Input
        label="サーバーアドレス"
        style={styles.input}
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
