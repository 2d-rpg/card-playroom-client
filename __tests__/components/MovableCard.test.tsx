import React from "react";
import { Animated } from "react-native";
import renderer from "react-test-renderer";

import { MovableCard } from "../../src/components/MovableCard";

describe("<MovableCard />", () => {
  it("should match snapshot", () => {
    const position = new Animated.ValueXY({ x: 0, y: 0 });
    const rendered = renderer
      .create(
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
      )
      .toJSON();
    expect(rendered).toMatchSnapshot();
  });
});
