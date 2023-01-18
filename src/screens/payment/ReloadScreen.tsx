import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";
import axios from "axios";
import { siteUrl } from "../../config/site";
import { AuthContext } from "../../context/AuthContext";
import tw from "twrnc";
import { fonts } from "../../constants/fonts";
import { Button } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { width } from "../../utils";
import SubmitBtn from "../../components/button/SubmitBtn";

const amountOptions = [
  { value: 10, label: "RM10" },
  { value: 20, label: "RM20" },
  { value: 50, label: "RM50" },
  { value: null, label: "Other" },
];

const ReloadScreen = (props) => {
  const { navigation } = props;
  const textInputRef = useRef(null);
  const [amount, setAmount] = useState<number>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { userToken, userData } = useContext(AuthContext);

  const handleReload = async () => {
    try {
      setIsLoading(true);
      if (amount === null || amount === 0) {
        Alert.alert("Error", "Please enter a valid amount");
        setIsLoading(false);
        return;
      } else if (amount < 10) {
        Alert.alert("Error", "Minimum reload amount is RM10");
        setIsLoading(false);
        return;
      } else if (!userData.displayName) {
        Alert.alert("Error", "Please update your profile to continue", [
          {
            text: "Update",
            onPress: () => navigation.navigate("ProfileScreen"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]);
        setIsLoading(false);
        return;
      }

      let res = await axios.post(
        `${siteUrl}/wallet/topup`,
        {
          collection_id: "uarcqs7t",
          mobile: userData.phone,
          name: userData.displayName,
          amount: amount * 100,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      // console.log(res.data.data);
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      navigation.navigate("PaymentScreen", {
        url: res.data.data.url,
        billId: res.data.data.id,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader theme={"light"} title={"Reload"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        )}
        <ScrollView style={styles.container}>
          <View style={styles.reloadContainer}>
            <Text style={[fonts.p]}>Enter your preferred amount</Text>
            <View style={[tw`flex-row items-center mt-2`]}>
              <Text style={[fonts.h3]}>RM</Text>
              <TextInput
                ref={textInputRef}
                placeholder=""
                keyboardType="numeric"
                onChangeText={(num) => setAmount(Number(num))}
                value={amount?.toString()}
                style={[
                  tw`ml-2 mb-2`,
                  fonts.h3,
                  { borderBottomWidth: 0.5, flex: 1 },
                ]}
              />
            </View>
            <Text style={[fonts.p, { color: colors.lightGrey }]}>
              Min reload amount is RM10
            </Text>
            <View style={[tw`flex-row items-center mt-4`]}>
              {amountOptions.map((item, index) => (
                <TouchableWithoutFeedback
                  key={index}
                  onPress={() => {
                    setAmount(item.value);
                    textInputRef.current.focus();
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.lightWhite,
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 0.5,
                      borderColor: colors.lightGrey,
                      marginLeft: index === 0 ? 0 : 5,
                      marginRight: index === amountOptions.length - 1 ? 0 : 5,
                      padding: 10,
                      borderRadius: 16,
                    }}
                  >
                    <Text>{item.label}</Text>
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </View>
            <View style={[tw`mt-4`]}>
            <Text style={[fonts.p, { color: colors.lightGrey }]}>
              *Withdrawal can only be done via local wire bank transfer
            </Text>
            </View>
          </View>
        </ScrollView>
        <SubmitBtn
          callback={handleReload}
          text="Reload"
          disabled={amount < 10}
        />
      </KeyboardAvoidingView>
    </>
  );
};

export default ReloadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  reloadContainer: {
    marginTop: 30,
    marginHorizontal: 20,
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
});
