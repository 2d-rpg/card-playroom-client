import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// eslint-disable-next-line no-undef
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// StatusBar mock
// eslint-disable-next-line no-undef
jest.mock("react-native/Libraries/Components/StatusBar/StatusBar", () =>
  // eslint-disable-next-line no-undef
  jest.genMockFromModule(
    "react-native/Libraries/Components/StatusBar/StatusBar"
  )
);

// eslint-disable-next-line no-undef
jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require("react-native-reanimated/mock");

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// eslint-disable-next-line no-undef
jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");
