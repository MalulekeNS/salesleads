import api from "../api/axios";

export const fetchLeads = async () => {
  const res = await api.get("/api/leads");
  return res.data;
};
