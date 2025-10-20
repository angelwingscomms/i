export interface SyncAudioMeta {
	u: string; // audio url
	k?: string; // mime type
	d?: number; // duration ms
}

export interface SyncGenerated {
	v?: string; // exported video url
}

export interface SyncProject {
	s: 'sync';
	u: string; // owner user id
	d: number; // created timestamp ms
	t: number[]; // marker timestamps ms sorted asc
	n?: string; // project name
	m?: SyncAudioMeta; // audio metadata
	l?: number; // last autosave timestamp ms
	g?: SyncGenerated; // generated assets
}
