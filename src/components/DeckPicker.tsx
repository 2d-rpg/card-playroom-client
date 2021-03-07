import React, { ReactElement } from "react";
import { Picker } from "@react-native-picker/picker";
import { TextStyle, StyleProp } from "react-native";
import { Deck } from "../entities/Deck";

// ローカル/サーバー のデッキ選択のためのセレクトボックス
export const DeckPicker = (
  selectedId: number | string | undefined,
  onPickerValueChanged: (itemValue: React.ReactText, itemIndex: number) => void,
  pickerItems: Deck[],
  style?: StyleProp<TextStyle>
): ReactElement => {
  return (
    <Picker
      selectedValue={selectedId}
      style={style}
      onValueChange={onPickerValueChanged}
    >
      {pickerItems.map((pickerItem) => {
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
