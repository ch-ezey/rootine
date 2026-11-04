import API from "./httpClient.js";

// The signed-in user's own account
export const getMe = async () => {
  const res = await API.get("/user/me");
  return res.data;
};

export const updateMe = async (userUpdates) => {
  const res = await API.put("/user/me", userUpdates);
  return res.data;
};

export const deleteMe = async () => {
  await API.delete("/user/me");
};
