import { v4 } from 'uuid';

export function new_id(): string {
	return v4();
}
