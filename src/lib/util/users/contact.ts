const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalize_phone = (value: string) =>
	value.replace(/\s+/g, '').replace(/[^+\d]/g, '');

export const is_valid_phone = (value: string) => {
	const normalized = normalize_phone(value);
	return (
		normalized.length >= 7 && normalized.length <= 32
	);
};

export const sanitize_phone_list = (
	values: string[]
) => {
	const unique = Array.from(
		new Set(
			values
				.filter((value) => typeof value === 'string')
				.map((value) => normalize_phone(value))
				.filter((value) => value.length > 0)
		)
	);
	return unique.filter((value) =>
		is_valid_phone(value)
	);
};

export const normalize_email = (value: string) =>
	value.trim().toLowerCase();

export const validate_email = (value: string) =>
	EMAIL_REGEX.test(normalize_email(value));

export const sanitize_email_list = (
	values: string[]
) =>
	Array.from(
		new Set(
			values
				.filter((value) => typeof value === 'string')
				.map((value) => normalize_email(value))
				.filter((value) => validate_email(value))
		)
	);
