import { EmailMessage } from 'cloudflare:email';

export async function send_reset_email(
	env: { SEND_EMAIL: { send: (message: EmailMessage) => Promise<void> } },
	from: string,
	recipient: string,
	link: string
) {
	if (!env?.SEND_EMAIL || typeof env.SEND_EMAIL.send !== 'function') {
		throw new Error('email binding missing');
	}
	if (!from) {
		throw new Error('sender email missing');
	}
	const lines = [
		`From: ${from}`,
		`To: ${recipient}`,
		'Subject: reset your password',
		'Content-Type: text/plain; charset=utf-8',
		'',
		`reset your password using this link: ${link}`,
		'this link expires in 24 hours.'
	];
	const message = new EmailMessage(
		from,
		recipient,
		lines.join('\r\n')
	);
	await env.SEND_EMAIL.send(message);
}
