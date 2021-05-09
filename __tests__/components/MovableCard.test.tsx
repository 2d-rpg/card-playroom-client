import React from "react";
import { Animated } from "react-native";
import { render } from "@testing-library/react-native";

import { MovableCard } from "../../src/components/MovableCard";

describe("<MovableCard />", () => {
  it("should match snapshot", () => {
    const position = new Animated.ValueXY({ x: 0, y: 0 });
    const rendered = render(
      <MovableCard
        face={undefined}
        back={"resources/testing.jpg"}
        width={12}
        height={36}
        endpoint={""}
        onCardRelease={() => {
          console.log("released!");
        }}
        position={position}
      />
    ).toJSON();
    expect(rendered).toMatchSnapshot();
  });
});
