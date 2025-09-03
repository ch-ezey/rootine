import API from "./api";

export const getRoutines = async () => {
	const res = await API.get("/routines");
	return res.data;
};

export const createRoutine = async (routine) => {
	const res = await API.post("/routines", routine);
	return res.data;
};

export const deleteRoutine = async (id) => {
	const res = await API.delete(`/routines/${id}`);
	return res.data;
};
