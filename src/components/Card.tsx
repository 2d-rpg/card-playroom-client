import React, { ReactElement } from "react";
import { Image } from "react-native";
import { Dimensions } from "react-native";

export default function Card(props: {
  facePath: string;
  backPath: string;
  endpoint: string;
}): ReactElement {
  // TODO ズームイン，ズームアウト時の拡大縮小に対応
  // TODO 画像読み込み失敗時の対応
  const windowHeight = Dimensions.get("window").height;
  const height = windowHeight / 5;
  const width = (height * 2) / 3;
  return (
    <Image
      style={{
        margin: 10,
        width: width,
        height: height,
      }}
      resizeMode={"contain"}
      source={{
        uri: `http://${props.endpoint}${props.facePath}`,
      }}
    />
  );
}
