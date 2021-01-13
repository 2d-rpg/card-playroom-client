import React, { ReactElement, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button, Input } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { Formik } from "formik";
import * as Yup from "yup";

export default function CreateRoomScreen({
  route,
  navigation,
}: {
  route: CreateRoomScreenRouteProp;
  navigation: CreateRoomScreenNavigationProp;
}): ReactElement {
  // const [createRoom] = useMutation(CREATE_ROOM, {
  //   onCompleted: (data) => {
  //     console.log(data.createRoom.id);
  //     navigation.navigate("Room", { id: data.createRoom.id });
  //   },
  // });
  const { endpoint } = route.params;
  const websocket = useRef<WebSocket | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    websocket.current = new WebSocket(`ws://${endpoint}/ws`);
    websocket.current.onmessage = (event) => {
      if (event.data.startsWith("{")) {
        const json = JSON.parse(event.data);
        if (json.status === "ok") {
          setExists(false);
          navigation.navigate("Room", {
            roomid: json.data.id,
            endpoint: endpoint,
          });
        } else {
          setExists(true);
        }
      }
    };
    return () => {
      if (websocket.current != null) {
        websocket.current.close();
      }
    };
  }, []);

  const onSubmit = async (values: { name: string }) => {
    // データ送信
    console.log(values);
    if (websocket.current != null) {
      websocket.current.send(`/create ${values.name}`);
    }
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(3, "3文字以上で入力してください")
      .max(20, "20文字以内で入力してください")
      .required("ルーム名を入力してください"),
  });
  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          name: "",
        }}
        validateOnMount
        validationSchema={schema}
        onSubmit={(values) => onSubmit(values)}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          isValid,
          isSubmitting,
          values,
          errors,
          touched,
        }) => (
          <>
            <View>
              {errors.name && touched.name ? <Text>{errors.name}</Text> : null}
            </View>
            {exists ? (
              <Input
                label="新規ルーム名"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                errorMessage="既に存在するルーム名です"
                errorStyle={{ color: "red" }}
                placeholder="ルーム名を入力してください"
              />
            ) : (
              <Input
                label="新規ルーム名"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                placeholder="ルーム名を入力してください"
              />
            )}
            <Button
              title="Submit"
              onPress={() => handleSubmit()}
              disabled={!isValid || isSubmitting}
              style={styles.button}
            />
          </>
        )}
      </Formik>
    </View>
  );
}

type CreateRoomScreenRouteProp = RouteProp<RootStackParamList, "CreateRoom">;
type CreateRoomScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CreateRoom"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: { margin: 10 },
});
