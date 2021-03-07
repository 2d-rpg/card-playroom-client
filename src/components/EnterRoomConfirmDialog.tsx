import React, { ReactElement } from "react";
import Dialog from "react-native-dialog";
import { DeckPicker } from "../components/DeckPicker";
import { Deck } from "../entities/Deck";

// 部屋作成，入室時のデッキ選択ダイアログ
export const EnterRoomConfirmDialog = (props: {
  visible: boolean;
  selectedDeckId: string | number | undefined;
  onPickerValueChanged: (itemValue: React.ReactText, itemIndex: number) => void;
  decks: Deck[];
  onPressCancelButton: () => void;
  onPressEnterButton: () => void;
}): ReactElement => {
  return (
    <Dialog.Container visible={props.visible}>
      <Dialog.Title>デッキ選択</Dialog.Title>
      <DeckPicker
        selectedId={props.selectedDeckId}
        onValueChanged={props.onPickerValueChanged}
        items={props.decks}
        width={200}
      />
      <Dialog.Button label="キャンセル" onPress={props.onPressCancelButton} />
      <Dialog.Button label="入室" onPress={props.onPressEnterButton} />
    </Dialog.Container>
  );
};
