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
import {
  ApolloClient,
  HttpLink,
  split,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import "reflect-metadata";

const cache = new InMemoryCache();

const httpLink = new HttpLink({
  uri: "http" + ENDPOINT + ":8080/graphql",
});

const wsLink = new WebSocketLink({
  uri: "ws" + ENDPOINT + ":8080/graphql",
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: cache,
  link: splitLink,
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
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Room" component={RoomScreen} />
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
  Room: { id: number };
  CreateRoom: undefined;
  RoomList: undefined;
  EditDeck: undefined;
  Preferences: undefined;
};

const Stack = createStackNavigator();
