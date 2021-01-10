import React, { ReactElement } from "react";
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  ParamListBase,
  RouteProp,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/screens/home/index";
import RoomScreen from "./src/screens/room/index";
import CreateRoomScreen from "./src/screens/create-room/index";
import RoomListScreen from "./src/screens/room-list/index";
import EditDeckScreen from "./src/screens/edit-deck/index";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import "reflect-metadata";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "react-native-elements";

const customFetch = async (uri: string, options: RequestInit) => {
  try {
    const endpoint = await AsyncStorage.getItem("@endpoint");
    if (endpoint == null) {
      return fetch(`http://127.0.0.1${uri}`, options);
    } else {
      return fetch(`http://${endpoint}${uri}`, options);
    }
  } catch (error) {
    // 設定読み込みエラー
    console.log(error);
    return fetch(`http://127.0.0.1${uri}`, options);
  }
};
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ fetch: customFetch }),
  uri: "/graphql",
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
            headerLeft: () => null,
          }}
        >
          <Stack.Screen
            // TODO 名前変更
            name="Home"
            options={({ route }) => ({
              headerTitle: getHeaderTitle(route),
            })}
          >
            {() => (
              <Tab.Navigator initialRouteName="Home">
                <Tab.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    tabBarIcon: homeIcon,
                  }}
                />
                <Tab.Screen
                  name="RoomList"
                  component={RoomListScreen}
                  options={{
                    tabBarIcon: roomListIcon,
                  }}
                />
                <Tab.Screen
                  name="EditDeck"
                  component={EditDeckScreen}
                  options={{
                    tabBarIcon: editDeckIcon,
                  }}
                />
              </Tab.Navigator>
            )}
          </Stack.Screen>

          <Stack.Screen name="Room" component={RoomScreen} />
          <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Room: { roomname: string; endpoint: string };
  CreateRoom: { endpoint: string };
  RoomList: undefined;
  EditDeck: undefined;
  Preferences: undefined;
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const getHeaderTitle = (route: RouteProp<ParamListBase, "Home">) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  switch (routeName) {
    case "RoomList":
      return "RoomList";
    case "EditDeck":
      return "EditDeck";
    default:
      return routeName;
  }
};

const homeIcon = ({ color, size }: { color: string; size: number }) => {
  return <Icon name="home" color={color} size={size} />;
};

const roomListIcon = ({ color, size }: { color: string; size: number }) => {
  return <Icon name="meeting-room" color={color} size={size} />;
};

const editDeckIcon = ({ color, size }: { color: string; size: number }) => {
  return (
    <Icon type="material-community" name="cards" color={color} size={size} />
  );
};
