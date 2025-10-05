<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import type {
		Map as LeafletMap,
		Marker
	} from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	type Props = {
		lat: number;
		lon: number;
		zoom?: number;
		onchange: ({
			lat,
			lon
		}: {
			lat: number;
			lon: number;
		}) => void;
	};

	let {
		lat,
		lon,
		zoom = 15,
		onchange
	}: Props = $props();

	let container: HTMLDivElement | null = null;
	let map: LeafletMap | null = null;
	let marker: Marker | null = null;

	async function init_map() {
		if (!browser || !container) return;
		const L = await import('leaflet');
		map = L.map(container, {
			zoomControl: true
		}).setView([lat, lon], zoom);
		L.tileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				maxZoom: 19,
				attribution:
					'© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
			}
		).addTo(map);
		marker = L.marker([lat, lon], {
			draggable: true
		}).addTo(map);
		marker.on('dragend', () => {
			const pos = marker?.getLatLng();
			if (!pos) return;
			onchange({ lat: pos.lat, lon: pos.lng });
		});
		map.on('click', (event: any) => {
			const { lat: click_lat, lng: click_lon } =
				event.latlng;
			marker?.setLatLng([click_lat, click_lon]);
			onchange({ lat: click_lat, lon: click_lon });
		});
	}

	onMount(() => {
		void init_map();
	});

	onDestroy(() => {
		map?.remove();
		map = null;
		marker = null;
	});

	$effect(() => {
		if (!map || !marker) return;
		marker.setLatLng([lat, lon]);
		map.setView([lat, lon], map.getZoom());
	});
</script>

<div
	class="rounded-3xl border border-[var(--color-theme-6)]"
>
	<div
		class="h-72 w-full overflow-hidden rounded-3xl"
		bind:this={container}
		aria-label="zone map"
	></div>
</div>
