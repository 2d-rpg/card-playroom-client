import React from "react";
import { render } from "@testing-library/react-native";

import { Card } from "../../src/components/Card";

const cardComponent = (
  <Card
    facePath={undefined}
    backPath={"resources/testing.jpg"}
    width={12}
    height={36}
    endpoint={""}
  />
);

describe("<Card />", () => {
  const rendered = render(cardComponent).toJSON();
  it("should match snapshot", () => {
    expect(rendered).toMatchSnapshot();
  });

  it("should be Image type", () => {
    expect(rendered?.type).toEqual("Image");
  });

  it("should be geven width, height", () => {
    expect(rendered?.props?.style).toEqual({ width: 12, height: 36 });
  });
});
