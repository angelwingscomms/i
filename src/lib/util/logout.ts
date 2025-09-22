import { goto } from '$app/navigation';
import { unsubscribe_push } from './notifications/index.js';
import axios from 'axios';

export async function logout() {
	await unsubscribe_push();
	try {
		await axios.post('/api/logout');
	} catch (e) {
		console.error(e.response?.data || e.message);
	}
	goto('/');
}