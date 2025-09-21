// src/hooks/useAdminSession.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export const useAdminSession = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get("http://localhost:8080/api/admin/me", {
          withCredentials: true,
        });
        // ✅ If request is successful, do nothing (stay on page)
      } catch (err) {
        // ✅ If 401 or any error -> redirect to login
        if (err.response?.status === 401) {
          navigate("/admin/login");
        }
      }
    };

    checkSession();
  }, [navigate]);
};
