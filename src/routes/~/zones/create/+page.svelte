<script lang="ts">
import axios from 'axios';
import { goto } from '$app/navigation';
import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
import Button from '$lib/components/Button.svelte';
import { ZoneMap } from '$lib/components/zone';
import { toast } from '$lib/util/toast.svelte.js';

const zone = $state({ n: '', l: 0, g: 0 });
let place_query = $state('');
let place_results = $state(
	[] as Array<{
		place_id: string;
		display_name: string;
		lat: string;
		lon: string;
	}>
);
let searching = $state(false);
let search_timeout: ReturnType<typeof setTimeout> | null = null;
let skip_search = false;
let map_visible = $state(false);
let saving = $state(false);
let has_location = $state(false);

$effect(() => {
	const query = place_query.trim();
	if (skip_search) {
		skip_search = false;
		return;
	}
	if (!query) {
		place_results = [];
		if (search_timeout) {
			clearTimeout(search_timeout);
			schedule = null;
		}
		return;
	}
	if (query.length < 3) return;
	if (search_timeout) clearTimeout(search_timeout);
	search_timeout = setTimeout(() => {
		void fetch_places();
	}, 400);
});

async function fetch_places() {
	const query = place_query.trim();
	if (!query || query.length < 3) return;
	searching = true;
	try {
		const url = new URL(
			'https://nominatim.openstreetmap.org/search'
		);
		url.searchParams.set('format', 'jsonv2');
		url.searchParams.set('limit', '5');
		url.searchParams.set('q', query);
		const response = await fetch(url.toString(), {
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) {
			throw new Error('search failed');
		}
		const data = (await response.json()) as Array<{
			place_id: number | string;
			display_name: string;
			lat: string;
			lon: string;
		}>;
		place_results = data.map((place) => ({
			place_id: String(place.place_id),
			display_name: place.display_name,
			lat: place.lat,
			lon: place.lon
		}));
	} catch (error) {
		console.error('openstreetmap search error', error);
		toast.error('failed to search for places');
	} finally {
		searching = false;
	}
}

function set_location(lat: number, lon: number) {
	zone.l = Number(lat.toFixed(6));
	zone.g = Number(lon.toFixed(6));
	has_location = true;
}

function select_place(place: {
	place_id: string;
	display_name: string;
	lat: string;
	lon: string;
}) {
	skip_search = true;
	place_query = place.display_name;
	zone.n = place.display_name;
	set_location(Number(place.lat), Number(place.lon));
	place_results = [];
	if (search_timeout) {
		clearTimeout(search_timeout);
		schedule = null;
	}
	map_visible = true;
}

$effect(() => {
	if (has_location && !map_visible) {
		map_visible = true;
	}
});

async function save() {
	const n = zone.n.trim();
	if (!n) {
		toast.error('name required');
		return;
	}
	if (!has_location) {
		toast.error('choose a location');
		return;
	}
	if (saving) return;
	saving = true;
	try {
		const response = await axios.post('/zones', {
			n,
			l: zone.l,
			g: zone.g
		});
		const id = response.data?.i as string | undefined;
		if (!id) throw new Error('missing zone id');
		toast.success('zone created');
		await goto(`/~/zones/${id}`);
	} catch (error) {
		console.error('create zone error', error);
		toast.error('failed to create zone');
	} finally {
		saving = false;
	}
}
</script>
	<div class="mb-6">
		<a
			href="/~/zones"
			class="inline-flex items-center font-medium lowercase text-[var(--text-accent)] hover:text-[var(--accent-primary)]"
			>&larr; back to zones</a
		>
	</div>

	<h1 class="mb-6 text-2xl font-bold lowercase text-[var(--accent-primary)]">
		create zone
	</h1>


	<div class="space-y-4">
		<div>
			<label class="mb-2 block text-sm font-medium lowercase text-[var(--text-secondary)]" for="zone-name">
				name
			</label>
			<DescriptionInput
				id="zone-name"
				bind:value={zone.n}
				placeholder="enter zone name"
				label=""
				editable={true}
			/>
		</div>

		<div class="space-y-2">
			<label class="mb-2 block text-sm font-medium lowercase text-[var(--text-secondary)]" for="place-query">
				search places near you
			</label>
			<DescriptionInput
				id="place-query"
				bind:value={place_query}
				placeholder="search openstreetmap"
				send={() => fetch_places()}
				send_loading={searching}
				label=""
				voice_typing={true}
				ontranscribe={() => {}}
			/>
				{#if place_results.length}
					<ul class="space-y-2">
						{#each place_results as place (place.place_id)}
							<li>
					<button
						type="button"
						onclick={() => select_place(place)}
						class="block w-full rounded-3xl border-l border-[var(--color-theme-6)] bg-transparent p-4 text-left transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--color-theme-1)]"
					>
						<p class="text-sm font-semibold text-[var(--color-theme-4)]">
							{place.display_name}
						</p>
						<p class="mt-1 text-xs text-[var(--color-theme-3)]">
							lat {Number(place.lat).toFixed(5)} • lon {Number(place.lon).toFixed(5)}
						</p>
					</button>
							</li>
						{/each}
					</ul>
				{:else if place_query && !searching}
					<p class="text-xs lowercase text-[var(--color-theme-3)]">
						no places found
					</p>
				{/if}
			</div>

		{#if map_visible || (zone.l && zone.g)}
			<div class="space-y-2">
				<label class="mb-2 block text-sm font-medium lowercase text-[var(--text-secondary)]" for="zone-map">
					adjust location
				</label>
	<ZoneMap
		id="zone-map"
		lat={zone.l || 0}
		lon={zone.g || 0}
		onchange={({ detail }) => {
			set_location(detail.lat, detail.lon);
		}}
	/>
					<p class="text-xs lowercase text-[var(--color-theme-3)]">
						move the pin or tap the map to set the exact spot
					</p>
				</div>
			{/if}

		<div class="grid grid-cols-2 gap-4">
		<div>
			<label class="mb-2 block text-sm font-medium lowercase text-[var(--text-secondary)]" for="zone-lat">
				latitude
			</label>
			<input
				id="zone-lat"
				type="number"
				step="any"
				bind:value={zone.l}
				placeholder="latitude"
				class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
				required
				oninput={() => (has_location = true)}
			/>
		</div>
		<div>
			<label class="mb-2 block text-sm font-medium lowercase text-[var(--text-secondary)]" for="zone-lon">
				longitude
			</label>
			<input
				id="zone-lon"
				type="number"
				step="any"
				bind:value={zone.g}
				placeholder="longitude"
				class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
				required
				oninput={() => (has_location = true)}
			/>
		</div>
	</div>

	<Button
		text={saving ? 'creating...' : 'create zone'}
		onclick={save}
		loading={saving}
		disabled={saving}
		type="button"
		wide={true}
	/>
</div>
