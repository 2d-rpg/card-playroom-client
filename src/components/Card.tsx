import React, { ReactElement } from "react";
import { Image } from "react-native";

export default function Card(props: {
  facePath: string | undefined;
  backPath: string | undefined;
  width: number;
  height: number;
  endpoint: string;
}): ReactElement {
  // TODO ズームイン，ズームアウト時の拡大縮小に対応
  // TODO 画像読み込み失敗時の対応
  return (
    <Image
      style={{
        width: props.width,
        height: props.height,
      }}
      resizeMode={"contain"}
      source={{
        uri: `http://${props.endpoint}${props.facePath}`,
      }}
    />
  );
}
