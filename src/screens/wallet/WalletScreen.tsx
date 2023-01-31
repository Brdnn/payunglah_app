import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import tw from "twrnc";
import axios from "axios";
import { siteUrl } from "../../config/site";
import { AuthContext } from "../../context/AuthContext";
import { fonts } from "../../constants/fonts";
import LinearGradient from "react-native-linear-gradient";
import { Icon, ListItem } from "@rneui/themed";
import { TransactionType } from "../../types/Types";
import Svg, { Path } from "react-native-svg";
import { width } from "../../utils";
import SubmitBtn from "../../components/button/SubmitBtn";

const statusColor = {
  completed: {
    bgColor: colors.success,
    textColor: colors.white,
  },
  pending: {
    bgColor: "#FFC107",
    textColor: "black",
  },
  failed: {
    bgColor: colors.danger,
    textColor: colors.white,
  },
};

const WalletScreen = (props) => {
  const navigation = useNavigation();
  const { userToken, userData } = useContext(AuthContext);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [transactionData, setTransactionData] =
    useState<TransactionType[]>(null);
  const [isMoreData, setIsMoreData] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  useEffect(() => {
    if (!userToken) {
      Alert.alert("Error", "Please login to continue");
      navigation.navigate("AuthScreen");
      return;
    }
  }, [userToken]);

  useFocusEffect(
    useCallback(() => {
      getUserBalance();
      getMyTransactions();
    }, [])
  );

  const getUserBalance = async () => {
    try {
      setIsLoading(true);
      let res = await axios.get(`${siteUrl}/wallet/balance`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      setUserBalance(res.data.data.balance);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  const getMyTransactions = async () => {
    try {
      let res = await axios.get(
        `${siteUrl}/transaction?limit=${perPage}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsInitialLoading(false);
        return;
      }
      let dummyArr = [];

      // for (let i = 0; i < 10; i++) {
      //   let date = new Date();
      //   dummyArr.push(
      //     Object.assign({}, res.data.data[0], {
      //       id: res.data.data[0].id + i * 39,
      //       type: Math.random() < 0.5 ? "debit" : "credit",
      //       createdAt: date.setDate(date.getDate() + i * 23),
      //       amount: Math.random() * 100,
      //     })
      //   );
      // }
      // console.log(res.data.data.length);
      if (res.data.data.length >= perPage) {
        setIsMoreData(true);
      }
      setTransactionData(res.data.data);
      setIsInitialLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const getExtraPage = async () => {
    try {
      const newPage = page + 1;
      let res = await axios.get(
        `${siteUrl}/transaction?limit=${perPage}&page=${newPage}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      let dummyArr = [];

      // for (let i = 0; i < 10; i++) {
      //   let date = new Date();
      //   dummyArr.push(
      //     Object.assign({}, res.data.data[0], {
      //       id: res.data.data[0].id + i * 39,
      //       type: Math.random() < 0.5 ? "debit" : "credit",
      //       createdAt: date.setDate(date.getDate() + i * 23),
      //       amount: Math.random() * 100,
      //     })
      //   );
      // }
      setPage(newPage);
      setTransactionData([...transactionData, ...res.data.data]);
      // setUserBalance(res.data.data.balance);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isInitialLoading && !isLoading && isMoreData) {
      getExtraPage();
    }
  };

  const renderTransaction = ({ item, index }) => {
    return (
      <View style={styles.listContainer}>
        <View style={tw`flex-row items-center justify-between `}>
          <Text style={[fonts.h2, { fontSize: 16 }]}>#{item.id}</Text>
          <View
            style={{
              backgroundColor: statusColor?.[item.status]?.bgColor,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 5,
            }}
          >
            <Text
              style={[
                fonts.h3,
                {
                  color: statusColor[item.status]?.textColor,
                  fontSize: 12,
                  textTransform: "capitalize",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 pr-4`}>
            <Text
              numberOfLines={2}
              style={[fonts.p, { fontSize: 14, color: colors.lightGrey }]}
            >
              {item.remarks}
            </Text>
            <Text style={[fonts.p, { fontSize: 14, color: colors.lightGrey }]}>
              {new Date(item.createdAt).toDateString()}
            </Text>
          </View>
          <Text
            style={[
              fonts.h3,
              {
                fontSize: 16,
                color: item.type == "debit" ? colors.danger : colors.success,
              },
            ]}
          >
            {item.type == "debit" ? "-" : "+"} RM
            {item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={{ height: 1, backgroundColor: colors.lightWhite }} />;
  };

  return (
    <>
      <CustomHeader title="" theme="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text
              style={[fonts.h3, { fontSize: 14, color: colors.lightWhite }]}
            >
              Your balance
            </Text>
            <View style={tw``}>
              <Text style={[fonts.h3, { fontSize: 28, color: colors.white }]}>
                RM {userBalance.toFixed(2)}
              </Text>
            </View>
            <View style={tw`flex-row mt-2`}>
              <TouchableWithoutFeedback
                onPress={() => navigation.navigate("ReloadScreen")}
              >
                <View style={styles.reloadBtn}>
                  <Text
                    style={[fonts.h3, { fontSize: 16, color: colors.primary }]}
                  >
                    Reload
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <Icon
            size={64}
            name="wallet"
            type="ionicon"
            color={colors.secondary}
          />
        </View>
        <Svg
          height="20%"
          width="100%"
          viewBox="0 0 1440 320"
          style={{ position: "absolute", top: 65, zIndex: 999 }}
        >
          <Path
            fill={colors.primary}
            fill-opacity="1"
            d="M0,128L120,144C240,160,480,192,720,176C960,160,1200,96,1320,64L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
          ></Path>
        </Svg>
        <FlatList
          contentInset={{ top: 50 }}
          data={transactionData}
          keyExtractor={(item, index) => `${item.id}-${index}}`}
          renderItem={renderTransaction}
          ItemSeparatorComponent={renderSeparator}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
        {userBalance > 0 && (
          <SubmitBtn
            disabled={userBalance <= 0}
            text="Withdrawal"
            callback={() =>
              navigation.navigate("WithdrawalScreen", {
                balance: userBalance,
              })
            }
          />
        )}
      </View>
    </>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingBottom: 5,
    // height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reloadBtn: {
    backgroundColor: colors.white,
    borderRadius: 32,
    paddingHorizontal: 30,
    paddingVertical: 3,
  },
  listContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});
