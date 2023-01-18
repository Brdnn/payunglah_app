import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { siteUrl } from "../../config/site";
import tw from "twrnc";
import { fonts } from "../../constants/fonts";
import { colors } from "../../constants/colors";
import SubmitBtn from "../../components/button/SubmitBtn";

const ProfileScreen = (props) => {
  const { navigation } = props;
  const { userToken, userData, setUserData } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(null);
  const [email, setEmail] = useState<string>(null);

  useEffect(() => {
    getMyProfile();
  }, []);

  const getMyProfile = async () => {
    try {
      let res = await axios.get(`${siteUrl}/user/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        return;
      }

      setUserData(res.data.data);
      setDisplayName(res.data.data.displayName);
      setEmail(res.data.data.email);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let res = await axios.put(
        `${siteUrl}/user/me`,
        {
          displayName,
          email,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        return;
      }
  
      setUserData(res.data.data);
      navigation.goBack()
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader title="Profile" theme="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.container}>
          <View style={styles.contentContainer}>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Display name
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  placeholder=""
                  onChangeText={(str) => {
                    setDisplayName(str);
                  }}
                  value={displayName}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
            </View>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Email
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  placeholder=""
                  onChangeText={(str) => {
                    setEmail(str);
                  }}
                  value={email}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
            </View>
            <View style={[tw`mt-6`]}>
              <Text
                style={[fonts.h2, { fontSize: 16, color: colors.lightBlack }]}
              >
                Phone number
              </Text>
              <View style={[styles.textInputContainer]}>
                <TextInput
                  placeholder=""
                  editable={false}
                  selectTextOnFocus={false}
                  value={userData.phone}
                  style={[tw`ml-2`, fonts.h3, { fontSize: 16, flex: 1 }]}
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <SubmitBtn callback={handleSaveProfile} text="Save" />
      </KeyboardAvoidingView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    marginHorizontal: 20,
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
