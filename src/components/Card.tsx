import React, { ReactElement } from "react";
import { Image } from "react-native";

export default function Card(props: {
  facePath: string;
  backPath: string;
  endpoint: string;
}): ReactElement {
  // TODO サイズ調整
  return (
    <Image
      style={{
        width: 102,
        height: 150,
      }}
      source={{
        uri: `http://${props.endpoint}${props.facePath}`,
      }}
    />
  );
}
