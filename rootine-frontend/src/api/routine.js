import API from "./api";

export const getRoutines = async () => {
	const res = await API.get("/routines");
	return res.data;
};

export const getRoutineByUserId = async (userId) => {
	const res = await API.get(`/routine/user/${userId}`);
	return res.data;
};

export const createRoutine = async (routine) => {
	const res = await API.post("/routine", routine);
	return res.data;
};

export const deleteRoutine = async (id) => {
	const res = await API.delete(`/routine/${id}`);
	return res.data;
};
