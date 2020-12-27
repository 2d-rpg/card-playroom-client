import React, { ReactElement } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { gql, useMutation } from "@apollo/client";
import { Formik } from "formik";
import * as Yup from "yup";
import { ENDPOINT } from "@env";

const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $player: String!) {
    createRoom(name: $name, player: $player) {
      id
      name
      players
    }
  }
`;

export default function CreateRoomScreen({
  navigation,
}: {
  navigation: CreateRoomScreenNavigationProp;
}): ReactElement {
  const [createRoom] = useMutation(CREATE_ROOM, {
    onCompleted: (data) => {
      console.log(data.createRoom.id);
      navigation.navigate("Room", { id: data.createRoom.id }); // TODO
    },
  });

  const onSubmit = async (values: { name: string }) => {
    // データ送信
    console.log(values);
    createRoom({ variables: { name: values.name, player: "piypiyo" } });
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(3, "3文字以上で入力してください")
      .max(20, "20文字以内で入力してください")
      .required("ルーム名を入力してください"),
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
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
                {errors.name && touched.name ? (
                  <Text>{errors.name}</Text>
                ) : null}
                <TextInput
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="ルーム名を入力してください"
                />
              </View>
              <Button
                title="Submit"
                onPress={() => handleSubmit()}
                disabled={!isValid || isSubmitting}
              />
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

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
});
