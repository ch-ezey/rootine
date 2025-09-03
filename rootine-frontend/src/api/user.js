import API from "./api";

export const getAllUsers = async () => {
	const res = await API.get("/user/users");
	return res.data;
};

export const getUserById = async (id) => {
	const res = await API.get(`/user/${id}`);
	return res.data;
};
