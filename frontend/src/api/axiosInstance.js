// src/api/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api/admin", // You can adjust path per role
  withCredentials: true,
});

export default instance;
