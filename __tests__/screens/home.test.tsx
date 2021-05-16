import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import HomeScreen from "../../src/screens/home/index";

describe("<HomeScreen />", () => {
  // snapshot
  it("should match snapshot", () => {
    const rendered = render(<HomeScreen />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  // default text
  it("should match default value", () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("RNE__Input__text-input").props.value).toEqual(
      "127.0.0.1"
    );
  });
});
