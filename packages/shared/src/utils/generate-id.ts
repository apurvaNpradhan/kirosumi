import { customAlphabet } from "nanoid";

const generateId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);
export const publicIds = {
	user: () => `USR-${generateId()}`,
	project: () => `PROJ-${generateId()}`,
	task: () => `TASK-${generateId()}`,
	note: () => `NOTE-${generateId()}`,
	capture: () => `CAP-${generateId()}`,
	space: () => `SPA-${generateId()}`,
	status: () => `ST-${generateId()}`,
	prefix: (prefix: string) => `${prefix}-${generateId()}`,
};
