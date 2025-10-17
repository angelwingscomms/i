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
	const email_message_ctor = await load_email_message_ctor();
	const lines = [
		`From: ${from}`,
		`To: ${recipient}`,
		'Subject: reset your password',
		'Content-Type: text/plain; charset=utf-8',
		'',
		`reset your password using this link: ${link}`,
		'this link expires in 24 hours.'
	];
	const message = new email_message_ctor(
		from,
		recipient,
		lines.join('\r\n')
	);
	await env.SEND_EMAIL.send(message);
}

type email_message_ctor_type = new (from: string, to: string, content: string) => EmailMessage;

let cached_email_message_ctor: email_message_ctor_type | undefined;

async function load_email_message_ctor() {
	if (cached_email_message_ctor) {
		return cached_email_message_ctor;
	}
	try {
		const module = await import('cloudflare:email');
		cached_email_message_ctor = module.EmailMessage;
		return cached_email_message_ctor;
	} catch (error) {
		class fallback_email_message implements EmailMessage {
			from: string;
			to: string;
			raw: string;
			constructor(from: string, to: string, content: string) {
				this.from = from;
				this.to = to;
				this.raw = content;
			}
		}
		cached_email_message_ctor = fallback_email_message as unknown as email_message_ctor_type;
		return cached_email_message_ctor;
	}
}
