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

const WithdrawalScreen = (props) => {
  const { navigation } = props;
  const { balance } = props.route.params;
  const textInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(null);
  const [bankName, setBankName] = useState<string>(null);
  const [bankAcc, setBankAcc] = useState<string>(null);
  const [fullName, setFullName] = useState<string>(null);
  const [isFormReady, setIsFormReady] = useState<boolean>(false);

  const { userToken, userData } = useContext(AuthContext);

  useEffect(() => {
    handleFormCheck();
  }, [amount, bankName, bankAcc, fullName]);

  const handleFormCheck = () => {
    if (
      amount === null ||
      amount === 0 ||
      amount < 10 ||
      bankName === null ||
      bankAcc === null ||
      fullName === null
    ) {
      setIsFormReady(false);
      return;
    }
    setIsFormReady(true);
  };
  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      if (amount < 10) {
        Alert.alert("Error", "Minimum withdraw amount is RM10");
        setIsLoading(false);
        return;
      } else if (amount > balance) {
        Alert.alert("Error", "Insufficient balance");
        setIsLoading(false);
        return;
      }

      let res = await axios.post(
        `${siteUrl}/wallet/withdrawal`,
        {
          bankName,
          bankAcc,
          fullName,
          amount,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log(res.data.data);
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      navigation.goBack();
      setIsLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader theme={"light"} title={"Withdraw"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.container}>
          {isLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          )}
          <View style={styles.contentContainer}>
            <View style={styles.balanceContainer}>
              <Text
                style={[fonts.h3, { fontSize: 16, color: colors.lightWhite }]}
              >
                Balance
              </Text>
              <Text style={[fonts.h2, { fontSize: 20, color: colors.white }]}>
                RM{balance.toFixed(2)}
              </Text>
            </View>
            <View style={[tw`mt-8`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Amount
              </Text>
              <View style={[styles.textInputContainer]}>
                <Text style={[fonts.h3, { fontSize: 16 }]}>RM</Text>
                <TextInput
                  ref={textInputRef}
                  placeholder=""
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    setAmount(Number(num));
                  }}
                  value={amount?.toString()}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
              <Text style={[tw`mt-1`, fonts.p, { color: colors.lightGrey }]}>
                Min withdrawal amount is RM10
              </Text>
            </View>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Bank name
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  ref={textInputRef}
                  placeholder=""
                  onChangeText={(str) => {
                    setBankName(str);
                  }}
                  value={bankName}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
              <Text style={[tw`mt-1`, fonts.p, { color: colors.lightGrey }]}>
                E.g. PUBLIC BANK BERHAD
              </Text>
            </View>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Bank account
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  ref={textInputRef}
                  placeholder=""
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    setBankAcc(num);
                  }}
                  value={bankAcc?.toString()}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
            </View>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Beneficiary Full Name
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  ref={textInputRef}
                  placeholder=""
                  onChangeText={(str) => {
                    setFullName(str);
                  }}
                  value={fullName}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <SubmitBtn
          callback={handleWithdraw}
          text="Reload"
          disabled={!isFormReady}
        />
      </KeyboardAvoidingView>
    </>
  );
};

export default WithdrawalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
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
  balanceContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: colors.lightWhite,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
