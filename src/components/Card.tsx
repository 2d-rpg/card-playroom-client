import React, { ReactElement } from "react";
import { Image } from "react-native";

export default function Card(props: {
  faceUrl: string;
  backUrl: string;
}): ReactElement {
  // TODO サイズ調整
  return (
    <Image
      style={{
        width: 102,
        height: 150,
      }}
      source={{
        uri: props.faceUrl,
      }}
    />
  );
}
