import React, { ReactElement } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/home/index";
import RoomScreen from "./src/screens/room/index";
import CreateRoomScreen from "./src/screens/create-room/index";
import RoomListScreen from "./src/screens/room-list/index";
import EditDeckScreen from "./src/screens/edit-deck/index";
import PreferencesScreen from "./src/screens/preferences/index";
import { ENDPOINT } from "@env";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// const socket = io(ENDPOINT + ":3000", {
//   transports: ["websocket"],
// });

const cache = new InMemoryCache();

const client = new ApolloClient({
  uri: ENDPOINT + ":8080/graphql",
  cache,
  defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
});

export default function App(): ReactElement {
  return (
    <ApolloProvider client={client}>
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
          <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
          <Stack.Screen name="RoomList" component={RoomListScreen} />
          <Stack.Screen name="EditDeck" component={EditDeckScreen} />
          <Stack.Screen name="Preferences" component={PreferencesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Room: undefined;
  CreateRoom: undefined;
  RoomList: undefined;
  EditDeck: undefined;
  Preferences: undefined;
};

const Stack = createStackNavigator();
