import React from "react";
import renderer from "react-test-renderer";

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
  it("should match snapshot", () => {
    const rendered = renderer.create(cardComponent).toJSON();
    expect(rendered).toMatchSnapshot();
  });

  it("should be Image type", () => {
    const rendered = renderer.create(cardComponent).toJSON();
    expect(rendered?.type).toEqual("Image");
  });

  it("should be geven width, height", () => {
    const rendered = renderer.create(cardComponent).toJSON();
    expect(rendered?.props?.style).toEqual({ width: 12, height: 36 });
  });
});
