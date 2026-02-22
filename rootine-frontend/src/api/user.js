import API from "./api";

export const getAllUsers = async () => {
  const res = await API.get("/user/users");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await API.get(`/user/${id}`);
  return res.data;
};

export const updateUser = async (id, userUpdates) => {
  const res = await API.put(`/user/${id}`, userUpdates);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/user/${id}`);
  return res.data;
};
