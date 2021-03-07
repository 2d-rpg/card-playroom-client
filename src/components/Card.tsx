import React, { ReactElement } from "react";
import { Image } from "react-native";

export const Card = (props: {
  facePath: string | undefined;
  backPath: string | undefined;
  width: number;
  height: number;
  endpoint: string;
}): ReactElement => {
  // TODO ズームイン，ズームアウト時の拡大縮小に対応
  // TODO 背面画像の対応
  if (props.facePath == null) {
    return (
      <Image
        style={{
          width: props.width,
          height: props.height,
        }}
        resizeMode={"contain"}
        source={require("../../assets/not_found.png")}
      />
    );
  } else {
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
};
