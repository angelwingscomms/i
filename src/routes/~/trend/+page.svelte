<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { line } from 'd3-shape';

	let data = $state([]);
	let peaks = $state([]);
	let troughs = $state([]);
	const width = 800;
	const height = 400;

	const xScale = scaleLinear();
	const yScale = scaleLinear();
	const priceLine = line().x(d => xScale(d.x)).y(d => yScale(d.y));

	function trendLine(points) {
		if (points.length < 2) return '';
		const n = points.length;
		const sx = points.reduce((a, p) => a + p.x, 0);
		const sy = points.reduce((a, p) => a + p.y, 0);
		const sxy = points.reduce((a, p) => a + p.x * p.y, 0);
		const sxx = points.reduce((a, p) => a + p.x * p.x, 0);
		const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
		const intercept = (sy - slope * sx) / n;
		return line().x(d => xScale(d.x)).y(d => yScale(slope * d.x + intercept))(data);
	}

	onMount(async () => {
		const now = Math.floor(Date.now() / 1000);
		const period1 = now - 31536000;  // 1 year ago
		const res = await fetch(
			`https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?period1=${period1}&period2=${now}&interval=1m`
		);
		const json = await res.json();
		const closes = json.chart.result[0].indicators.quote[0].close;

		data = closes.map((y, x) => ({ x, y })).filter(d => d.y);  // Filter nulls

		peaks = data.filter((d, i) => i > 20 && i < data.length - 20 && d.y > data[i - 20].y && d.y > data[i + 20].y);
		troughs = data.filter((d, i) => i > 20 && i < data.length - 20 && d.y < data[i - 20].y && d.y < data[i + 20].y);

		xScale.domain([0, data.length - 1]).range([50, width - 50]);
		yScale.domain([Math.min(...data.map(d => d.y)) * 0.95, Math.max(...data.map(d => d.y)) * 1.05]).range([height - 50, 50]);
	});
</script>

<svg {width} {height}>
	{#if data.length}
		<path d={priceLine(data)} stroke="#f7931a" fill="none" stroke-width="2" />
		{#each peaks as p}
			<circle cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill="red" />
		{/each}
		{#each troughs as p}
			<circle cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill="green" />
		{/each}
		{#if trendLine(peaks)}
			<path d={trendLine(peaks)} stroke="red" stroke-dasharray="6,4" opacity="0.8" fill="none" />
		{/if}
		{#if trendLine(troughs)}
			<path d={trendLine(troughs)} stroke="green" stroke-dasharray="6,4" opacity="0.8" fill="none" />
		{/if}
	{/if}
</svg>

<style>
	svg { background: #111; display: block; }
</style>