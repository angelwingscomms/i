<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import type { SyncProject } from '$lib/types';
	import { toast } from '$lib/util/toast.svelte';
	import { sanitize_markers } from '$lib/util/sync/markers';

	type SyncPageData = SyncProject & { i: string };

	let { project } = $props<{
		project: SyncPageData;
	}>();

	let audio_el: HTMLAudioElement | null = null;
	let is_playing = $state(false);
	let markers = $state<number[]>([...project.t]);
	let name = $state(project.n ?? '');
	let autosaving = $state(false);
	let last_saved = $state(project.l ?? project.d);
	let audio_meta = $state(project.m);
	let audio_duration = $state<number | null>(
		project.m?.d ?? null
	);
	let current_time = $state(0);
	let play_raf: number | null = null;
	let play_start = 0;
	let timeline_el: HTMLDivElement | null = null;
	let scrubbing = $state(false);
	let scrubbing_was_playing = false;

	let save_controller: AbortController | null = null;
	let schedule_id: ReturnType<
		typeof setTimeout
	> | null = null;

	const AUTOSAVE_DELAY = 2160;
	const MAX_DURATION = 30 * 60 * 1000;

	const has_audio = $derived(Boolean(audio_meta?.u));
	const markers_limit = $derived(() =>
		markers.length
			? markers[markers.length - 1] + 2000
			: 0
	);
	const total_duration = $derived(() => {
		const audio_ms =
			typeof audio_duration === 'number' &&
			audio_duration > 0
				? audio_duration
				: 0;
		const fallback =
			audio_ms === 0 && markers_limit === 0
				? 10_000
				: 0;
		return Math.max(
			audio_ms,
			markers_limit,
			fallback
		);
	});
	const playhead_position = $derived(() => {
		if (total_duration <= 0) return 0;
		return Math.max(
			0,
			Math.min(1, current_time / total_duration)
		);
	});

	$effect(() => {
		const sanitized = sanitize_markers(markers, {
			max_duration: MAX_DURATION
		});
		if (!arrays_equal(markers, sanitized)) {
			markers = sanitized;
		}
	});

	$effect(() => {
		debounced_save();
	});

	onMount(() => {
		if (audio_meta?.u && audio_el) {
			audio_el.src = audio_meta.u;
			void audio_el.load();
		}
	});

	onDestroy(() => {
		if (schedule_id) clearTimeout(schedule_id);
		if (save_controller) save_controller.abort();
		if (play_raf !== null)
			cancelAnimationFrame(play_raf);
		if (audio_el && !audio_el.paused) {
			audio_el.pause();
		}
		if (audio_meta?.u?.startsWith('blob:')) {
			URL.revokeObjectURL(audio_meta.u);
		}
	});

	async function debounced_save() {
		if (schedule_id) clearTimeout(schedule_id);
		schedule_id = setTimeout(async () => {
			schedule_id = null;
			await autosave();
		}, AUTOSAVE_DELAY);
	}

	async function autosave() {
		try {
			autosaving = true;
			if (save_controller) save_controller.abort();
			save_controller = new AbortController();
			const res = await fetch(
				`/~/sync/${project.i}`,
				{
					method: 'PATCH',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						n: name.trim() || undefined,
						t: markers,
						m: audio_meta,
						l: Date.now()
					}),
					signal: save_controller.signal
				}
			);
			if (!res.ok) {
				throw new Error('autosave failed');
			}
			const data = await res.json();
			last_saved = data.l ?? Date.now();
		} catch (err) {
			if (
				err instanceof DOMException &&
				err.name === 'AbortError'
			) {
				return;
			}
			console.error('autosave error', err);
			toast.error('autosave failed', 4000);
		} finally {
			autosaving = false;
		}
	}

	function toggle_playback() {
		if (is_playing) {
			stop_playback();
			return;
		}
		void start_playback();
	}

	function handle_time_update() {
		if (!audio_el) return;
		current_time = Math.floor(
			audio_el.currentTime * 1000
		);
		if (
			audio_el.duration &&
			Number.isFinite(audio_el.duration)
		) {
			audio_duration = Math.floor(
				audio_el.duration * 1000
			);
		}
	}

	function handle_audio_end() {
		stop_playback(true);
		if (audio_el?.duration) {
			current_time = Math.floor(
				audio_el.duration * 1000
			);
		}
	}

	function handle_loaded_metadata() {
		if (
			!audio_el ||
			!Number.isFinite(audio_el.duration)
		)
			return;
		audio_duration = Math.floor(
			audio_el.duration * 1000
		);
	}

	function add_marker() {
		const time_ms = audio_el
			? Math.floor(audio_el.currentTime * 1000)
			: current_time;
		if (!Number.isFinite(time_ms) || time_ms < 0) {
			return;
		}
		markers = [...markers, time_ms];
	}

	function clear_markers() {
		markers = [];
	}

	async function handle_export() {
		try {
			const res = await fetch(
				`/~/sync/${project.i}/export`,
				{
					method: 'POST'
				}
			);
			if (!res.ok) throw new Error('export failed');
			const data = await res.json();
			if (data?.url) {
				toast.success('export ready');
				window.open(data.url, '_blank');
			}
		} catch (err) {
			console.error('export error', err);
			toast.error('export failed', 4000);
		}
	}

	function on_audio_change(event: Event) {
		const file = (event.target as HTMLInputElement)
			.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('audio/')) {
			toast.error('audio only', 4000);
			return;
		}
		upload_audio(file);
	}

	async function start_playback() {
		if (has_audio && audio_el) {
			try {
				const seek_seconds = current_time / 1000;
				if (Number.isFinite(seek_seconds)) {
					audio_el.currentTime = Math.max(
						0,
						seek_seconds
					);
				}
				await audio_el.play();
				is_playing = true;
				play_raf = requestAnimationFrame(
					step_manual_playback
				);
				return;
			} catch (err) {
				console.error('audio play error', err);
				toast.error('unable to play audio', 4000);
			}
		}

		play_start =
			performance.now() - Math.max(0, current_time);
		is_playing = true;
		step_manual_playback();
	}

	function step_manual_playback() {
		if (!is_playing) return;
		const now = performance.now();
		const elapsed = now - play_start;
		const limit = total_duration;
		const clamped = Math.max(
			0,
			Math.min(elapsed, limit)
		);
		current_time = Math.floor(clamped);
		if (clamped >= limit) {
			stop_playback();
			current_time = Math.floor(limit);
			return;
		}
		play_raf = requestAnimationFrame(
			step_manual_playback
		);
	}

	function stop_playback(from_audio = false) {
		if (play_raf !== null) {
			cancelAnimationFrame(play_raf);
			play_raf = null;
		}
		if (!from_audio && audio_el && !audio_el.paused) {
			audio_el.pause();
		}
		is_playing = false;
	}

	function format_time(ms: number) {
		if (!Number.isFinite(ms) || ms < 0) {
			return '00:00.00';
		}

		const rounded = Math.floor(ms);
		const minutes = Math.floor(rounded / 60000)
			.toString()
			.padStart(2, '0');
		const seconds = Math.floor(
			(rounded % 60000) / 1000
		)
			.toString()
			.padStart(2, '0');
		const hundredths = Math.floor(
			(rounded % 1000) / 10
		)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}.${hundredths}`;
	}

	function current_color(
		values: number[],
		time: number
	) {
		const sorted = [...values].sort((a, b) => a - b);
		let index = 0;
		for (const marker of sorted) {
			if (time >= marker) {
				index += 1;
			}
		}
		return index % 2 === 0 ? '#000' : '#fff';
	}

	function remove_marker(index: number) {
		markers = markers.filter((_, i) => i !== index);
	}

	function arrays_equal(a: number[], b: number[]) {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i += 1) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	function handle_timeline_pointer_down(
		event: PointerEvent
	) {
		if (event.button !== 0 || !timeline_el) return;
		scrubbing = true;
		scrubbing_was_playing = is_playing;
		if (is_playing) {
			stop_playback();
		}
		timeline_el.setPointerCapture?.(event.pointerId);
		update_time_from_pointer(event);
	}

	function handle_timeline_pointer_move(
		event: PointerEvent
	) {
		if (!scrubbing) return;
		update_time_from_pointer(event);
	}

	function handle_timeline_pointer_up(
		event: PointerEvent
	) {
		if (!scrubbing) return;
		update_time_from_pointer(event);
		scrubbing = false;
		timeline_el?.releasePointerCapture?.(
			event.pointerId
		);
		if (scrubbing_was_playing) {
			void start_playback();
		}
		scrubbing_was_playing = false;
	}

	function update_time_from_pointer(
		event: PointerEvent
	) {
		if (!timeline_el || total_duration <= 0) return;
		event.preventDefault();
		const rect = timeline_el.getBoundingClientRect();
		const width = rect.width;
		if (!Number.isFinite(width) || width <= 0) return;
		const raw = (event.clientX - rect.left) / width;
		if (!Number.isFinite(raw)) return;
		const ratio = Math.max(0, Math.min(1, raw));
		const new_time = Math.max(
			0,
			Math.min(
				total_duration,
				Math.floor(ratio * total_duration)
			)
		);
		current_time = new_time;
		if (has_audio && audio_el) {
			const seconds = new_time / 1000;
			if (!Number.isFinite(seconds)) {
				return;
			}
			try {
				audio_el.currentTime = seconds;
			} catch (err) {
				console.warn('failed to seek audio', err);
			}
		} else {
			play_start = performance.now() - new_time;
		}
		if (is_playing && !has_audio) {
			play_start = performance.now() - new_time;
		}
	}

	async function upload_audio(file: File) {
		try {
			const url = URL.createObjectURL(file);
			const form = new FormData();
			form.set('file', file);
			form.set('duration', await get_duration(url));
			const res = await fetch(
				`/~/sync/${project.i}/audio`,
				{
					method: 'POST',
					body: form
				}
			);
			if (!res.ok) {
				throw new Error('upload failed');
			}
			const data = await res.json();
			audio_meta = data.m;
			audio_duration = data.m?.d ?? audio_duration;
			if (audio_el && audio_meta?.u) {
				audio_el.src = audio_meta.u;
				await audio_el.load();
			}
			toast.success('audio saved', 3000);
		} catch (err) {
			console.error('audio upload error', err);
			toast.error('audio upload failed', 4000);
		}
	}

	function get_duration(
		url: string
	): Promise<string> {
		return new Promise((resolve) => {
			const el = new Audio();
			el.preload = 'metadata';
			el.onloadedmetadata = () => {
				const duration = Math.floor(
					el.duration * 1000
				);
				resolve(String(duration));
				URL.revokeObjectURL(url);
			};
			el.onerror = () => {
				resolve('');
				URL.revokeObjectURL(url);
			};
			el.src = url;
		});
	}
</script>

<div class="flex flex-col gap-8">
	<div
		class="rounded-3xl border border-[var(--color-theme-6)] bg-[var(--surface-elevated)] p-6 shadow-lg"
	>
		<div class="flex flex-col gap-4">
			<label
				class="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]"
			>
				<span>project name</span>
				<input
					type="text"
					class="rounded-lg border border-[var(--color-theme-6)] bg-transparent px-4 py-3 text-base text-[var(--text-primary)] focus:border-[var(--color-theme-1)] focus:outline-none"
					bind:value={name}
					placeholder="beat sync"
				/>
			</label>

			<div class="flex flex-wrap items-center gap-4">
				<Button
					type="button"
					onclick={toggle_playback}
					text={is_playing ? 'pause' : 'play'}
					icon={is_playing
						? 'fa-circle-pause'
						: 'fa-circle-play'}
				/>
				<button
					type="button"
					onclick={add_marker}
					class="rounded-lg bg-[var(--color-theme-1)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-theme-2)]"
				>
					add marker @ {format_time(current_time)}
				</button>
				<button
					type="button"
					onclick={clear_markers}
					class="rounded-lg border border-[var(--color-theme-6)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
				>
					clear markers
				</button>
				<Button
					type="button"
					onclick={handle_export}
					text="export video"
					icon="fa-cloud-arrow-down"
				/>
			</div>

			<div class="flex flex-col gap-3">
				<label
					class="text-sm font-semibold text-[var(--text-primary)]"
					>audio track</label
				>
				<input
					type="file"
					accept="audio/*"
					onchange={on_audio_change}
					class="rounded-lg border border-dashed border-[var(--color-theme-6)] p-4 text-sm"
				/>
				{#if audio_meta?.u}
					<p class="text-xs text-[var(--text-muted)]">
						audio ready
					</p>
				{/if}
			</div>
		</div>

		<div
			class="mt-6 rounded-2xl border border-[var(--color-theme-6)] bg-[var(--surface-primary)] p-6"
		>
			<div class="flex flex-col gap-2">
				<span
					class="text-sm font-semibold text-[var(--text-muted)] uppercase"
				>
					timeline
				</span>
				<div
					class="relative h-32 rounded-xl bg-black text-white select-none"
					bind:this={timeline_el}
					onpointerdown={handle_timeline_pointer_down}
					onpointermove={handle_timeline_pointer_move}
					onpointerup={handle_timeline_pointer_up}
					onpointercancel={handle_timeline_pointer_up}
				>
					<div
						class="absolute inset-0 transition-all"
						style={`background:${current_color(markers, current_time)}`}
					></div>
					<div
						class="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[var(--color-theme-1)] shadow-[0_0_12px_rgba(0,0,0,0.45)] transition-[left] duration-75"
						style={`left:${(playhead_position * 100).toFixed(3)}%`}
					></div>
					<div
						class="pointer-events-none absolute -top-3 left-0 -translate-x-1/2 rounded bg-[var(--color-theme-1)] px-2 py-1 text-xs font-semibold text-white shadow-md transition-[left] duration-75"
						style={`left:${(playhead_position * 100).toFixed(3)}%`}
					>
						{format_time(current_time)}
					</div>
					<div
						class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-white/20 px-3 py-1 text-xs"
					>
						{format_time(current_time)}
					</div>
				</div>

				<ul
					class="mt-4 space-y-2 text-sm text-[var(--text-muted)]"
				>
					{#each markers as marker, index}
						<li
							class="flex items-center justify-between rounded-lg bg-[var(--surface-elevated)] px-3 py-2"
						>
							<span>
								{index + 1}. {format_time(marker)}
							</span>
							<button
								type="button"
								onclick={() => remove_marker(index)}
								class="text-xs tracking-wide text-[var(--color-theme-1)] uppercase hover:text-[var(--color-theme-2)]"
							>
								remove
							</button>
						</li>
					{/each}
					{#if markers.length === 0}
						<li
							class="rounded-lg bg-[var(--surface-elevated)] px-3 py-2 text-center text-xs tracking-wide text-[var(--text-muted)] uppercase"
						>
							no markers yet
						</li>
					{/if}
				</ul>
			</div>
		</div>
		<p class="mt-4 text-xs text-[var(--text-muted)]">
			last saved {last_saved
				? new Date(last_saved).toLocaleTimeString()
				: 'just now'}
			{#if autosaving}
				<span
					class="ml-2 animate-pulse text-[var(--color-theme-1)]"
				>
					saving…
				</span>
			{/if}
		</p>
	</div>

	<audio
		bind:this={audio_el}
		ontimeupdate={handle_time_update}
		onended={handle_audio_end}
		src={audio_meta?.u}
		class="hidden"
		controls
	/>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
	.animate-pulse {
		animation: pulse 1.4s infinite;
	}
</style>
