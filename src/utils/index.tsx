import { Alert, Dimensions } from "react-native";

export const { width, height } = Dimensions.get("window");

export const confirmAction = (
  title: string,
  message: string,
  okTitle: string,
  onConfirm: () => void
) => {
  Alert.alert(title, message, [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: okTitle ? okTitle : "OK",
      onPress: () => onConfirm(),
    },
  ]);
};
