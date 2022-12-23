import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";
import OTPTextView from "react-native-otp-textinput";
import tw from "twrnc";
import { width } from "../../utils";
import { Icon } from "@rneui/themed";
import axios from "axios";
import { siteUrl } from "../../config/site";
import { AuthContext } from "../../context/AuthContext";

const SMSOtpScreen = (props) => {
  let { navigation } = props;
  let { phone, country } = props.route.params;
  const { login } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    try {
      setIsLoading(true);
      let res = await axios.post(`${siteUrl}/auth/verify-otp`, {
        code: otp,
        phone,
      });
      console.log(res.data);
      if (!res.data?.token) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      login(res.data.token);
      navigation.navigate("HomeScreen");
      setIsLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader theme="dark" title="Verification" />
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        )}
        <View style={[tw`justify-center items-center mt-8`]}>
          <Icon
            reverse
            reverseColor={colors.white}
            type={"ionicon"}
            name="lock-closed"
            size={80}
            color={colors.primary}
          />
          <Text
            style={{
              marginTop: 20,
              fontSize: 22,
              color: colors.primary,
              fontWeight: "500",
            }}
          >
            Account Verification
          </Text>
          <Text style={{ marginTop: 20, color: colors.lightBlack }}>
            Please enter the 6-digit code sent to
          </Text>
          <Text style={{ color: colors.lightBlack, fontWeight: "bold" }}>
            {phone}
          </Text>
        </View>

        <View style={[{ marginHorizontal: 20 }]}>
          <OTPTextView
            containerStyle={styles.textInputContainer}
            textInputStyle={styles.roundedTextInput}
            handleTextChange={(code: string) => setOtp(code)}
            inputCount={6}
            keyboardType="numeric"
            tintColor={colors.primary}
            offTintColor={colors.primary}
          />
          <TouchableOpacity
            disabled={otp.length !== 6}
            onPress={verifyOtp}
            style={[
              styles.submitBtn,
              {
                backgroundColor: otp.length === 6 ? colors.primary : "grey",
              },
            ]}
          >
            <Text
              style={{ color: colors.white, fontWeight: "bold", fontSize: 16 }}
            >
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default SMSOtpScreen;

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
  roundedTextInput: {
    // borderRadius: 12,
    // borderWidth: 2,
    height: (width - 20) / 6,
    width: (width - 100) / 6,
    color: "#000",
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
