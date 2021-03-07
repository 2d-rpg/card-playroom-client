import React, { ReactElement } from "react";
import { Picker } from "@react-native-picker/picker";
import { Deck } from "../entities/Deck";

// ローカル/サーバー のデッキ選択のためのセレクトボックス
// TODO サーバー側のデッキを選べるようにする
export const DeckPicker = (props: {
  selectedId: number | string | undefined;
  onValueChanged: (itemValue: React.ReactText, itemIndex: number) => void;
  items: Deck[];
  width: number;
}): ReactElement => {
  return (
    <Picker
      selectedValue={props.selectedId}
      style={{
        width: props.width,
      }}
      onValueChange={props.onValueChanged}
    >
      {props.items.map((pickerItem) => {
        return (
          <Picker.Item
            key={pickerItem.id}
            label={pickerItem.name}
            value={pickerItem.id}
          />
        );
      })}
    </Picker>
  );
};
