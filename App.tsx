import React, { ReactElement, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Dimensions, ScaledSize } from "react-native";
import HomeScreen from "./src/screens/Home/index";
import RoomScreen from "./src/screens/Room/index";
import RoomListScreen from "./src/screens/RoomList/index";
import EditDeckScreen from "./src/screens/EditDeck/index";
import PreferencesScreen from "./src/screens/Preferences/index";

export default function App(): ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
        <Stack.Screen name="RoomList" component={RoomListScreen} />
        <Stack.Screen name="EditDeck" component={EditDeckScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Room: undefined;
  RoomList: undefined;
  EditDeck: undefined;
  Preferences: undefined;
};

const Stack = createStackNavigator();
