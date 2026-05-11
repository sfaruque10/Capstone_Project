import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const URL = "http://localhost:5001"; // replace with your IP

// export const URL = "http://192.168.1.139:5001";
const API = axios.create({
  baseURL: URL,
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
