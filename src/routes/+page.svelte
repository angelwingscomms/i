<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let heroEl: HTMLElement;
	let featuresEl: HTMLElement;
	let statsEl: HTMLElement;
	let ctaEl: HTMLElement;

	onMount(() => {
		// Add entrance animations to hero elements
		if (heroEl) {
			const elements = heroEl.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
			elements.forEach((el, i) => {
				setTimeout(() => {
					el.classList.add('animate-in');
				}, i * 200);
			});
		}

		// Intersection observer for scroll animations
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');

						// Animate feature cards
						if (entry.target === featuresEl) {
							const cards = entry.target.querySelectorAll('.feature-card');
							cards.forEach((card, i) => {
								setTimeout(() => {
									card.classList.add('animate-in');
								}, i * 100);
							});
						}

						// Animate stats numbers
						if (entry.target === statsEl) {
							const numbers = entry.target.querySelectorAll('.stat-number');
							numbers.forEach((num) => {
								const target = parseInt(num.getAttribute('data-count') || '0');
								animateNumber(num as HTMLElement, target);
							});
						}

						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);

		// Observe all animated sections
		[featuresEl, statsEl, ctaEl].forEach(el => {
			if (el) observer.observe(el);
		});
	});

	function animateNumber(element: HTMLElement, target: number) {
		let current = 0;
		const increment = target / 100;
		const timer = setInterval(() => {
			current += increment;
			if (current >= target) {
				current = target;
				clearInterval(timer);
			}
			element.textContent = Math.floor(current).toLocaleString();
		}, 20);
	}

	function handleGetStarted() {
		if (data.user) {
			goto('/u');
		} else {
			goto('/google');
		}
	}
</script>

<main>
	<!-- Hero Section -->
	<section class="hero-section" bind:this={heroEl}>
		<div class="floating-orb"></div>
		<div class="floating-orb"></div>
		<div class="floating-orb"></div>

		<div class="hero-content">
			<h1 class="hero-title">Connect. Discover. Thrive.</h1>
			<p class="hero-subtitle">
				The ultimate platform for finding products, services, and meaningful connections in your community.
				Experience the future of local discovery.
			</p>
			<div class="hero-cta">
				<button class="btn-primary btn-lg pulse-animation" onclick={handleGetStarted}>
					{data.user ? 'Explore Now' : 'Get Started Free'}
				</button>
				<a href="#features" class="btn-ghost btn-lg">Discover Features</a>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="stats-section animate-on-scroll" bind:this={statsEl}>
		<h2 class="section-title gradient-text">Trusted by thousands</h2>
		<div class="stats-grid">
			<div class="stat-item">
				<span class="stat-number" data-count="10000">0</span>
				<span class="stat-label">Active Users</span>
			</div>
			<div class="stat-item">
				<span class="stat-number" data-count="5000">0</span>
				<span class="stat-label">Products & Services</span>
			</div>
			<div class="stat-item">
				<span class="stat-number" data-count="500">0</span>
				<span class="stat-label">Communities</span>
			</div>
			<div class="stat-item">
				<span class="stat-number" data-count="50000">0</span>
				<span class="stat-label">Connections Made</span>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="features-grid animate-on-scroll" bind:this={featuresEl}>
		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-store"></i>
			</div>
			<h3 class="feature-title">Products & Services</h3>
			<p class="feature-description">
				Discover amazing local businesses, handcrafted products, and professional services.
				From artisan goods to expert consultations, find exactly what you need.
			</p>
			<a href="/i/create" class="feature-link">
				List Your Items <i class="fas fa-arrow-right"></i>
			</a>
		</div>

		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-map-marker-alt"></i>
			</div>
			<h3 class="feature-title">Smart Location Discovery</h3>
			<p class="feature-description">
				Advanced geolocation technology helps you find products, services, and people
				in your immediate vicinity. Never miss what's happening nearby.
			</p>
			<a href="/i/search_nearby" class="feature-link">
				Search Nearby <i class="fas fa-arrow-right"></i>
			</a>
		</div>

		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-comments"></i>
			</div>
			<h3 class="feature-title">Direct Messaging</h3>
			<p class="feature-description">
				Seamless real-time communication with product owners and service providers.
				Build trust, ask questions, and negotiate directly.
			</p>
			<a href="/u" class="feature-link">
				Start Conversations <i class="fas fa-arrow-right"></i>
			</a>
		</div>

		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-users"></i>
			</div>
			<h3 class="feature-title">Community Chatrooms</h3>
			<p class="feature-description">
				Join vibrant topic-based communities. Share experiences, get advice,
				and connect with people who share your interests and passions.
			</p>
			<a href="/r" class="feature-link">
				Join Communities <i class="fas fa-arrow-right"></i>
			</a>
		</div>

		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-brain"></i>
			</div>
			<h3 class="feature-title">AI-Powered Matching</h3>
			<p class="feature-description">
				Our intelligent algorithm analyzes your interests, location, and preferences
				to connect you with the most relevant people and opportunities.
			</p>
			<a href="/u" class="feature-link">
				Find Your Match <i class="fas fa-arrow-right"></i>
			</a>
		</div>

		<div class="feature-card">
			<div class="feature-icon">
				<i class="fas fa-user-circle"></i>
			</div>
			<h3 class="feature-title">Rich User Profiles</h3>
			<p class="feature-description">
				Create compelling profiles that showcase your personality, skills, and interests.
				Let others discover the real you through detailed descriptions and preferences.
			</p>
			<a href="/edit_user" class="feature-link">
				Build Your Profile <i class="fas fa-arrow-right"></i>
			</a>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section animate-on-scroll" bind:this={ctaEl}>
		<h2 class="cta-title">Ready to transform your local experience?</h2>
		<p class="cta-subtitle">
			Join a thriving community of creators, entrepreneurs, and connectors.
			Your next great discovery is just one click away.
		</p>
		<button class="btn-primary btn-xl pulse-animation" onclick={handleGetStarted}>
			{data.user ? 'Continue Your Journey' : 'Start Your Journey'}
		</button>
	</section>
</main>
