import { marked } from 'marked';

export const markedInstance = (text: string) => marked.parse(text, { breaks: true, gfm: true });
