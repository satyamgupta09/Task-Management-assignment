
const isValidTransition = (currentStatus, newStatus) => {
  // layering remaining
};

const updateTaskStatus = async (taskId, newStatus, user) => {
  // layring remaining
};

const assignTask = async (taskId, assignedUserId, user) => {
// layring remaining
};

const setDeadline = async (taskId, deadline, user) => {
 //layring remaining
};

const approveTask = async (taskId, user) => {
  // layring remaining
};

const requestChanges = async (taskId, user) => {
// layring remaining
};

module.exports = {
  validTransitions,
  isValidTransition,
  updateTaskStatus,
  assignTask,
  setDeadline,
  approveTask,
  requestChanges
};
