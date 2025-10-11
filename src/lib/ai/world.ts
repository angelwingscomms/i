import { generate } from '$lib/util/ai/generate';

export interface GeneratedCharacter {
	name: string;
	about: string;
	meta: Record<string, unknown>;
}

export interface GeneratedEnvironment {
	name: string;
	about: string;
	meta?: Record<string, unknown>;
}

const parse_json = (value: unknown) => {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (error) {
			return value;
		}
	}
	return value;
};

const parsed_json_object = (value: unknown) => {
	if (value === null || typeof value !== 'object') {
		return {};
	}
	return Object.entries(
		value as Record<string, unknown>
	).reduce(
		(acc, [key, entry]) => ({
			...acc,
			[key]: parse_json(entry)
		}),
		{}
	);
};

export const generate_character = async (
	world_description: string,
	existing_characters: string[] = []
): Promise<GeneratedCharacter> => {
	const prompt = `create a new character for the following world: "${world_description}".

existing characters: ${existing_characters.length > 0 ? existing_characters.join(', ') : 'none'}

generate a character with:
- name
- about (2-3 paragraphs describing history and role)
- traits (key facts like age, hometown, skills)

output valid json matching:
{
  "name": "character name",
  "about": "about text...",
  "traits": {
    "age": "",
    "hometown": "",
    "skills": []
  }
}`;

	const response = await generate(prompt);
	try {
		const parsed = JSON.parse(response);
		return {
			name: parsed.name,
			about: parsed.about,
			meta:
				typeof parsed.traits === 'object'
					? (parsed_json_object(
							parsed.traits
						) as Record<string, unknown>)
					: {}
		};
	} catch (error) {
		const lines = response.split('\n');
		let name = 'unnamed character';
		let about = '';
		const meta: Record<string, unknown> = {};
		let current_key = '';
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.toLowerCase().startsWith('name:')) {
				name = trimmed.split(':')[1]?.trim() || name;
			} else if (
				trimmed.toLowerCase().startsWith('about:')
			) {
				current_key = 'about';
			} else if (
				trimmed.toLowerCase().includes(':')
			) {
				const [key, ...rest] = trimmed.split(':');
				meta[key.trim().toLowerCase()] = rest
					.join(':')
					.trim();
				current_key = '';
			} else if (current_key === 'about') {
				about += `${trimmed}\n`;
			}
		}
		return {
			name: name.trim(),
			about: about.trim(),
			meta
		};
	}
};

export const generate_environment = async (
	world_description: string,
	existing_environments: string[] = []
): Promise<GeneratedEnvironment> => {
	const prompt = `create a new environment for the following world: "${world_description}".

existing environments: ${existing_environments.length > 0 ? existing_environments.join(', ') : 'none'}

generate an environment with:
- name
- about (2-3 paragraphs describing the place)
- details (key facts such as climate, purpose, notable figures)

output valid json matching:
{
  "name": "environment name",
  "about": "description text...",
  "details": {
    "climate": "",
    "purpose": ""
  }
}`;

	const response = await generate(prompt);
	try {
		const parsed = JSON.parse(response);
		return {
			name: parsed.name,
			about: parsed.about,
			meta:
				typeof parsed.details === 'object'
					? (parsed_json_object(
							parsed.details
						) as Record<string, unknown>)
					: undefined
		};
	} catch (error) {
		const lines = response.split('\n');
		let name = 'unnamed environment';
		let about = '';
		const meta: Record<string, unknown> = {};
		let current_section = '';
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.toLowerCase().startsWith('name:')) {
				name = trimmed.split(':')[1]?.trim() || name;
			} else if (
				trimmed.toLowerCase().startsWith('about:')
			) {
				current_section = 'about';
			} else if (trimmed.includes(':')) {
				const [key, ...rest] = trimmed.split(':');
				meta[key.trim().toLowerCase()] = rest
					.join(':')
					.trim();
				current_section = '';
			} else if (current_section === 'about') {
				about += `${trimmed}\n`;
			}
		}
		return {
			name: name.trim(),
			about: about.trim(),
			meta: Object.keys(meta).length
				? meta
				: undefined
		};
	}
};
