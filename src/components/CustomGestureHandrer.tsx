import React, { Props, PropsWithChildren, ReactElement } from "react";
import {
  TapGestureHandler,
  RotationGestureHandler,
} from "react-native-gesture-handler";

export const CustomGestureHandler = ({
  x,
  children,
}: PropsWithChildren<{ x: number }>): ReactElement => {
  return (
    <TapGestureHandler onHandlerStateChange={() => console.log("tap!")}>
      {children}
    </TapGestureHandler>
  );
};
