import React, { ReactElement } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/view/Home";
import RoomScreen from "./src/view/Room";

export default function App(): ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Stack = createStackNavigator();
