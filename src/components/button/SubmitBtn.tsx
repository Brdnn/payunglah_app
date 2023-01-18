import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../../constants/colors";
import { width } from "../../utils";
import { useNavigation } from "@react-navigation/native";
import { fonts } from "../../constants/fonts";

type SubmitBtnProps = {
  callback?: Function;
  disabled?: boolean;
  text: string;
  backgroundColor?: string;
  textColor?: string;
};

const SubmitBtn = (props: SubmitBtnProps) => {
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    submitBtn: {
      backgroundColor: props.disabled ? "grey" : props.backgroundColor
        ?  props.backgroundColor
        : colors.primary,
      position: "absolute",
      bottom: 30,
      width: width - 40,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      paddingVertical: 10,
      borderRadius: 12,
    },
    submitBtnText: {
      color: props.textColor ? props.textColor : colors.white,
      fontSize: 18,
    },
  });

  return (
    <TouchableOpacity
      disabled={props.disabled ? props.disabled : false}
      onPress={props.callback ? () => props.callback() : () => null}
      style={styles.submitBtn}
    >
      <Text style={[fonts.h2, styles.submitBtnText]}>{props.text}</Text>
    </TouchableOpacity>
  );
};

export default SubmitBtn;
