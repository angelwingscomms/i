import { DurableObject } from 'cloudflare:workers';

export class R extends DurableObject<Env> {
	sessions: WebSocket[];
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sessions = [];
	}

	async fetch(request: Request) {
		console.debug('--request', request)
		if (request.headers.get('Upgrade') !== 'websocket') {
			return new Response('Expected websocket', { status: 400 });
		}
		
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		server.accept();
		this.sessions.push(server);

		server.addEventListener('message', (event) => {
			console.debug('--event', event)
			this.sessions.forEach((session) => {
				session.send(event.data);
			});
		});

		server.addEventListener('close', () => {
			this.sessions = this.sessions.filter((session) => session !== server);
		});

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}

export default {
	async fetch() {
		return new Response('');
	},
};
