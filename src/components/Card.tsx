import React, { ReactElement } from "react";
import { Image, ImageProps } from "react-native";

export default function Card(props: {
  faceUrl: ImageProps;
  backUrl: ImageProps;
}): ReactElement {
  // TODO サイズ調整
  return (
    <Image
      style={{
        width: 102,
        height: 150,
      }}
      source={props.faceUrl}
    />
  );
}
