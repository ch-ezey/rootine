import API from "./httpClient.js";

export const createTask = async ({ routineId, ...task }) => {
  const res = await API.post("/task", task, { params: { routineId } });
  return res.data;
};

// Partial update: omitted fields are left unchanged
export const updateTask = async (taskId, task) => {
  const res = await API.put(`/task/${taskId}`, task);
  return res.data;
};

/**
 * Bulk reorder tasks within a routine.
 * The first id gets position 0, next gets 1, etc.
 */
export const reorderTasks = async (routineId, orderedTaskIds) => {
  await API.put(`/task/routine/${routineId}/reorder`, { orderedTaskIds });
};

export const deleteTask = async (taskId) => {
  await API.delete(`/task/${taskId}`);
};
