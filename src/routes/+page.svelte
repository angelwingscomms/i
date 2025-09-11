<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		});
		document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
	});
</script>

<svelte:head>
	<title>Apexlinks - Connect Genuinely</title>
	<meta name="description" content="Discover real chats, rooms, AI tools – anonymous and fun. Filter by age, gender, location for effortless connections." />
</svelte:head>

<!-- Hero Section -->
<section class="flex min-h-screen flex-col items-center justify-center text-center px-4">
	<div class="max-w-4xl">
		<h1 class="hero-title animate-on-scroll mb-4">Connect genuinely, discover effortlessly.</h1>
		<p class="hero-subtitle animate-on-scroll mb-8">Tired of endless swiping on apps that feel fake? Here, you can jump into real chats – video or text – with people who vibe with you. Filter by age, gender, or location, all while staying totally anonymous if you want. No pressure, just fun connections that happen fast.</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll" style="animation-delay: 0.3s;">
			<a href="/find" class="btn-primary">Start Matching Now</a>
			<a href="/google" class="btn-outline">Sign Up Free</a>
		</div>
	</div>
	<!-- Animated background orbs -->
	<div class="hero-background-orb fixed top-20 left-10 w-64 h-64 bg-[var(--color-theme-6)] opacity-20 animate-float"></div>
	<div class="hero-background-orb fixed bottom-20 right-10 w-48 h-48 bg-[var(--color-theme-2)] opacity-10 animate-float" style="animation-delay: -3s;"></div>
</section>

<!-- Features Section -->
<section class="features-grid py-16">
	<div class="feature-card animate-on-scroll">
		<div class="feature-icon bg-[var(--color-theme-1)]">
			<i class="fa fa-users"></i>
		</div>
		<h3 class="feature-title">Create & Join Rooms</h3>
		<p class="feature-description">Build your own group hangout or join existing ones on topics like gaming, music, or random fun. Chat via text or video meetings just like Zoom or Google Meet. Invite friends anonymously or discover new crews. It's like a cozy online party, minus the awkward intros.</p>
		<a href="/r" class="feature-link">Explore Rooms <i class="fa fa-arrow-right"></i></a>
	</div>

	<div class="feature-card animate-on-scroll" style="animation-delay: 0.1s;">
		<div class="feature-icon bg-[var(--color-theme-2)]">
			<i class="fa fa-video-camera"></i>
		</div>
		<h3 class="feature-title">Video Chat Matching</h3>
		<p class="feature-description">Live video chats with smart filters. Pick age range or gender, hit search, and boom – you're talking to someone cool in seconds. Perfect for that spontaneous 'hey, what's up?' vibe. Privacy first: End anytime, no traces.</p>
		<a href="/find" class="feature-link">Try Video Chat <i class="fa fa-arrow-right"></i></a>
	</div>

	<div class="feature-card animate-on-scroll" style="animation-delay: 0.2s;">
		<div class="feature-icon bg-[var(--color-theme-4)]">
			<i class="fa fa-comment"></i>
		</div>
		<h3 class="feature-title">Anonymous Text Chats</h3>
		<p class="feature-description">Chat without showing your face or name. Share thoughts, memes, whatever – keep it light and private. Great for testing the waters before going live. Easy as sending a text, but way more exciting.</p>
		<a href="/chats" class="feature-link">Start Anon Chat <i class="fa fa-arrow-right"></i></a>
	</div>

	<div class="feature-card animate-on-scroll" style="animation-delay: 0.3s;">
		<div class="feature-icon bg-[var(--color-theme-5)]">
			<i class="fa fa-user"></i>
		</div>
		<h3 class="feature-title">Build Profile & Search Nearby</h3>
		<p class="feature-description">Create a simple profile with interests and pics, then search locals by location. Find event buddies or chat partners nearby – all filtered to match your style. Super easy setup, total control on what you share.</p>
		<a href="/i/create" class="feature-link">Build Profile <i class="fa fa-arrow-right"></i></a>
	</div>

	<!--
	<div class="feature-card animate-on-scroll" style="animation-delay: 0.4s;">
		<div class="feature-icon bg-[var(--color-theme-3)]">
			<i class="fa fa-palette"></i>
		</div>
		<h3 class="feature-title">AI Image Generator (Pink)</h3>
		<p class="feature-description">Whip up custom images from prompts or presets – think fun avatars or creative visuals. Upload refs for style-matching, generate in a snap. Privacy note: Your ideas stay yours, no sharing required. Get artsy without the hassle.</p>
		<a href="/pink" class="feature-link">Generate Images <i class="fa fa-arrow-right"></i></a>
	</div>
	-->

	<!--
	<div class="feature-card animate-on-scroll" style="animation-delay: 0.5s;">
		<div class="feature-icon bg-[var(--color-theme-6)]">
			<i class="fa fa-play-circle"></i>
		</div>
		<h3 class="feature-title">YouTube Summarizer</h3>
		<p class="feature-description">Search videos, get instant summaries, and chat about them with AI. Dive deep without watching hours – ask questions, get insights. Fun for learning or debating clips, all in one spot. Quick, smart, and zero spoilers if you want.</p>
		<a href="/tools/youtube-video-summarize-tool" class="feature-link">Summarize Videos <i class="fa fa-arrow-right"></i></a>
	</div>
	-->
</section>

<!-- Footer -->
<footer class="bg-[var(--bg-secondary)] py-8 px-4 text-center border-t border-[var(--border-primary)]">
	<div class="max-w-4xl mx-auto">
		<p class="text-[var(--text-secondary)] mb-4">Quick jumps: <a href="/find" class="feature-link mx-1">Find Matches</a> | <a href="/chats" class="feature-link mx-1">Start Chats</a> | <a href="/r" class="feature-link mx-1">Create Rooms</a> | <a href="/pink" class="feature-link mx-1">AI Generator</a> | <a href="/tools/youtube-video-summarize-tool" class="feature-link mx-1">YouTube Tool</a> | <a href="/google" class="feature-link mx-1">Sign In</a> | <a href="/privacy" class="feature-link mx-1">Privacy Policy</a> – We keep your data safe and anonymous.</p>
		<p class="text-[var(--text-tertiary)]">Made for real connections. Join the fun today. © 2025 Apexlinks.</p>
	</div>
</footer>

<style>
	/* Simple visibility observer for animate-on-scroll */
	.animate-on-scroll {
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.6s ease;
	}
	.animate-on-scroll.visible {
		opacity: 1;
		transform: translateY(0);
	}
</style>
