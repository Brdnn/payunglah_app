import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";
import { width } from "../../utils";
import PhoneInput from "react-native-phone-number-input";
import { Icon } from "@rneui/themed";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { siteUrl } from "../../config/site";
import SubmitBtn from "../../components/button/SubmitBtn";

const AuthScreen = (props: { navigation: any }) => {
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const phoneInput = useRef<PhoneInput>(null);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const checkValid = phoneInput.current?.isValidNumber(value);

      if (!checkValid) {
        Alert.alert("Error", "Invalid phone number");
        setIsLoading(false);
        return;
      }

      let res = await axios.post(`${siteUrl}/auth/login`, {
        phone: formattedValue,
        country: phoneInput.current.getCountryCode(),
      });
      console.log(res.data.data);
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
      }

      navigation.navigate("SMSOtpScreen", {
        phone: formattedValue,
        country: phoneInput.current.getCountryCode(),
      });

      setIsLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
    // navigation.navigate("HomeScreen");
    // console.log("Sending OTP")
  };

  return (
    <>
      <CustomHeader theme="light" title={"Enter phone number"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {isLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            <View style={{ alignItems: "center" }}>
              <PhoneInput
                ref={phoneInput}
                defaultValue={value}
                defaultCode="MY"
                layout="first"
                onChangeText={(text) => {
                  setValue(text);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedValue(text);
                }}
                renderDropdownImage={
                  <Icon
                    size={18}
                    name="caret-down"
                    type="ionicon"
                    color={colors.lightBlack}
                  />
                }
                textContainerStyle={{
                  backgroundColor: colors.white,
                  borderBottomWidth: 0.5,
                  borderBottomColor: colors.lightBlack,
                }}
                codeTextStyle={{ color: colors.lightBlack }}
                containerStyle={{
                  backgroundColor: colors.white,
                }}
                textInputProps={{
                  placeholderTextColor: "#a9a9a9",
                  style: {
                    color: colors.lightBlack,
                  },
                }}
                flagButtonStyle={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: colors.lightBlack,
                  marginRight: 5,
                }}
                countryPickerProps={{
                  withAlphaFilter: true,
                  countryCodes: ["MY"],
                }}
                // withDarkTheme
                // withShadow
                // autoFocus
              />
            </View>
          </View>
          <SubmitBtn
            disabled={isLoading}
            text="Send Confirmation Pin"
            callback={handleLogin}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    width,
    zIndex: 9999,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 15,
    width: width - 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 15,
    borderRadius: 32,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
