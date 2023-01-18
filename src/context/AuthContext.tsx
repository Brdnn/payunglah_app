import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { dummy_userData } from "../config/data";
import { siteUrl } from "../config/site";
import { Alert } from "react-native";
import { SocketContext } from "./SocketContext";

export const AuthContext = createContext(null);

type UserData = {
  username: string;
  phone: string;
  wallet: number;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string>(null);
  const [userData, setUserData] = useState<UserData>(null);
  const socket = useContext(SocketContext);

  const login = async (token: string) => {
    try {
      setIsLoading(true);
      let res = await axios.get(`${siteUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      await SecureStore.setItemAsync("userToken", JSON.stringify(token));
      setUserToken(token);
      setUserData(res.data.data);
      socket.emit("user_connected", { userId: res.data.data.id });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync("userToken");
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      let res = await axios.get(`${siteUrl}/user/me`, {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });

      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        await SecureStore.deleteItemAsync("userToken");
        setUserToken(null);
        setUserData(null);
        setIsLoading(false);
        return;
      }
      console.log("Logged In", JSON.parse(token));
      setUserToken(JSON.parse(token));
      setUserData(res.data.data);
      socket.emit("user_connected", { userId: res.data.data.id });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, logout, isLoading, userToken, userData, setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
