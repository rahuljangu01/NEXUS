// client/src/utils/api.js (FULL & COMPLETE CODE)

import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/") {
          window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// --- User & Connection Management ---
export const searchUsers = async (query) => {
  const { data } = await api.get(`/users/search?q=${query}`);
  return data.users;
};

export const getUserProfile = async (userId) => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

export const getMyConnections = async () => {
  const { data } = await api.get('/connections/me');
  return data.connections;
};

export const sendConnectionRequest = async (userId) => {
  const { data } = await api.post(`/connections/send-request/${userId}`);
  return data;
};

export const acceptConnectionRequest = async (connectionId) => {
  const { data } = await api.put(`/connections/accept/${connectionId}`);
  return data;
};

export const rejectConnectionRequest = async (connectionId) => {
  const { data } = await api.put(`/connections/reject/${connectionId}`);
  return data;
};

export const removeConnection = async (connectionId) => {
  const { data } = await api.delete(`/connections/remove/${connectionId}`);
  return data;
};

// --- Profile & Account Management ---
export const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
};

export const changePassword = async (passwordData) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
};

// --- Messaging ---
export const getMessages = async (userId) => {
  const { data } = await api.get(`/messages/${userId}`);
  return { userId, messages: data.messages };
};

export const sendMessage = async (messageData) => {
  const { data } = await api.post("/messages/send", messageData);
  return data.message;
};

export const togglePinMessage = async (messageId) => {
  const { data } = await api.put(`/messages/pin/${messageId}`);
  return data;
};

export const forwardMessage = async (messageId, forwardToUserId) => {
  const { data } = await api.post('/messages/forward', { messageId, forwardToUserId });
  return data;
};

export const deleteMultipleMessages = async (messageIds) => {
  const { data } = await api.post('/messages/delete-multiple', { messageIds });
  return data;
};

// --- File Upload ---
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.file;
};

// --- Groups ---
export const discoverPublicGroups = async () => {
  const { data } = await api.get('/groups/discover');
  return data.groups;
};

export const joinGroup = async (groupId) => {
  const { data } = await api.post(`/groups/${groupId}/join`);
  return data;
};

export const addMembersToGroup = async (groupId, memberIds) => {
  const { data } = await api.post(`/groups/${groupId}/members/add-multiple`, { memberIds });
  return data;
};

// --- Status ---
export const createStatus = async (statusData) => {
  const { data } = await api.post('/status/create', statusData);
  return data;
};

export const getFriendsStatuses = async () => {
  const { data } = await api.get('/status');
  return data.statuses;
};

export const viewStatus = async (statusId) => {
  const { data } = await api.put(`/status/view/${statusId}`);
  return data;
};

export const likeStatus = async (statusId) => {
  const { data } = await api.put(`/status/like/${statusId}`);
  return data;
};

export const deleteStatus = async (statusId) => {
  const { data } = await api.delete(`/status/${statusId}`);
  return data;
};

export const sendVerificationCode = async (email) => {
  const { data } = await api.post('/auth/send-verification', { email });
  return data;
};

export const verifyAndRegisterUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

// --- Call History ---
export const logCall = async (callData) => {
  const { data } = await api.post('/calls/log', callData);
  return data;
};

export const getCallHistory = async () => {
  const { data } = await api.get('/calls/history');
  return data.history;
};

export const deleteCallRecord = async (callId) => {
  const { data } = await api.delete(`/calls/${callId}`);
  return data;
};

export const clearCallHistory = async () => {
  const { data } = await api.delete('/calls/clear');
  return data;
};

export default api;