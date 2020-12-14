import React, { ReactElement } from "react";
import { Image } from "react-native";
import { ENDPOINT } from "@env";

export default function Card(props: {
  facePath: string;
  backPath: string;
}): ReactElement {
  // TODO サイズ調整
  return (
    <Image
      style={{
        width: 102,
        height: 150,
      }}
      source={{
        uri: `http://${ENDPOINT}${props.facePath}`,
      }}
    />
  );
}
