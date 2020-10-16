import React, { ReactElement } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/home/index";
import RoomScreen from "./src/screens/room/index";
import RoomListScreen from "./src/screens/room-list/index";
import EditDeckScreen from "./src/screens/edit-deck/index";
import PreferencesScreen from "./src/screens/preferences/index";
import io from "socket.io-client";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default function App(): ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#706fd3" },
          headerTintColor: "white",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          // initialParams={{ socket: socket }}
        />
        <Stack.Screen
          name="Room"
          component={RoomScreen}
          // initialParams={{ socket: socket }}
        />
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
