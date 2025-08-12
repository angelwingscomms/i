<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	import type { PageData } from './$types';

	export let data: PageData;



	onMount(() => {
		// Hero entrance animation sequence
		const timeline = createTimeline()
		.add('.hero-title', {
			opacity: [0, 1],
			translateY: [100, 0],
			scale: [0.8, 1],
			duration: 1200,
		}, '-=1500')
		.add('.hero-subtitle', {
			opacity: [0, 1],
			translateY: [50, 0],
			duration: 800,
		}, '-=800')
		.add('.hero-cta', {
			opacity: [0, 1],
			translateY: [30, 0],
			scale: [0.9, 1],
			duration: 600,
		}, '-=400');

		// Pulse animation for CTA button
		animate('.pulse-button', {
			scale: [1, 1.05, 1],
			duration: 2000,
			loop: true,
			ease: 'inOutSine',
		});

		// Intersection observer for scroll animations
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Feature cards animation
						if (entry.target.classList.contains('features-section')) {
							animate('.feature-card', {
								opacity: [0, 1],
								translateY: [60, 0],
								scale: [0.8, 1],
								rotate: [5, 0],
								duration: 800,
								delay: stagger(150),
								ease: 'outElastic(1, .8)',
							});
						}



						// CTA section animation
						if (entry.target.classList.contains('cta-section')) {
							animate('.cta-content > *', {
								opacity: [0, 1],
								translateY: [40, 0],
								duration: 600,
								delay: stagger(200),
								ease: 'outQuart',
							});
						}

						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);

		// Observe sections
		document.querySelectorAll('.features-section, .cta-section').forEach(el => {
			observer.observe(el);
		});

		// Interactive hover animations
		document.addEventListener('mouseover', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('feature-card')) {
				animate(target, {
					scale: 1.05,
					translateY: -10,
					duration: 300,
					ease: 'outQuart'
				});
			}
			if (target.classList.contains('interactive-btn')) {
				animate(target, {
					scale: 1.1,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});

		document.addEventListener('mouseout', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('feature-card')) {
				animate(target, {
					scale: 1,
					translateY: 0,
					duration: 300,
					ease: 'outQuart'
				});
			}
			if (target.classList.contains('interactive-btn')) {
				animate(target, {
					scale: 1,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});
	});



	function handleGetStarted() {
		if (data.user) {
			goto('/u');
		} else {
			goto('/google');
		}
	}

	function scrollToFeatures() {
		const featuresSection = document.getElementById('features');
		if (featuresSection) {
			featuresSection.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}
</script>

<main class="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
	<!-- Hero Section -->
	<section class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
		

		<!-- Hero Content -->
		<div class="relative z-10 mx-auto max-w-6xl text-center">
			<div class="hero-title mb-8 opacity-0">
				<h1 class="text-7xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl" style="color: var(--color-theme-4);">
					Connect. <span style="color: var(--color-theme-1);">Discover.</span>
					<span style="color: var(--color-theme-2);">Thrive.</span>
				</h1>
				<div class="mt-4 h-2 w-32 mx-auto rounded-full" style=""></div>
			</div>

			<div class="hero-subtitle mb-12 opacity-0">
				<p class="text-2xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg md:text-xl">
					The ultimate platform for finding products, services, and meaningful connections in your community.<br>
					<span class="font-bold" style="color: var(--color-theme-3);">Experience the future of local discovery.</span>
				</p>
			</div>

			<div class="hero-cta mb-16 opacity-0">
				<div class="flex flex-col items-center gap-6 sm:gap-4">
					<button class="pulse-button interactive-btn group relative overflow-hidden rounded-full px-12 py-6 text-2xl font-bold transition-all sm:px-8 sm:py-4 sm:text-lg" style="background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);" onclick={handleGetStarted}>
						<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"></div>
						<div class="relative flex items-center gap-3">
							<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" class="sm:w-6 sm:h-6">
								<path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/>
							</svg>
							{data.user ? 'Explore Now' : 'Get Started Free'}
						</div>
					</button>
					<button onclick={scrollToFeatures} class="interactive-btn rounded-full px-8 py-4 text-lg font-semibold transition-all" style="color: var(--color-theme-4); border: 1px solid var(--color-theme-4); background: transparent;">
						Discover Features
					</button>
				</div>
			</div>


		</div>
	</section>



	<!-- Features Section -->
	<section id="features" class="features-section px-4 py-20 sm:py-12">
		<div class="mx-auto max-w-7xl">
			<!-- Section Header -->
			<div class="mb-20 text-center sm:mb-12">
				<h2 class="mb-6 text-5xl font-black sm:text-3xl" style="color: var(--color-theme-4);">
					Powerful Features for <span style="color: var(--color-theme-1);">Everyone</span>
				</h2>
				<p class="text-xl text-gray-600 dark:text-gray-300 sm:text-lg">
					Everything you need to connect, discover, and thrive in your community
				</p>
			</div>

			<!-- Features Grid -->
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				<!-- Products & Services -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-1);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-1);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">Products & Services</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Discover amazing local businesses, handcrafted products, and professional services. From artisan goods to expert consultations.
						</p>
						<div class="text-center">
							<a href="/i/create" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);">
								List Your Items
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Smart Location Discovery -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-2);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-2);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">Smart Location Discovery</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Advanced geolocation technology helps you find products, services, and people in your immediate vicinity.
						</p>
						<div class="text-center">
							<a href="/i/search_nearby" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-2); color: var(--color-theme-2);">
								Search Nearby
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Direct Messaging -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-3);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-3);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">Direct Messaging</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Seamless real-time communication with product owners and service providers. Build trust and negotiate directly.
						</p>
						<div class="text-center">
							<a href="/u" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-3); color: var(--color-theme-3);">
								Start Conversations
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Community Chatrooms -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-4);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-4);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">Community Chatrooms</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Join vibrant topic-based communities. Share experiences, get advice, and connect with like-minded people.
						</p>
						<div class="text-center">
							<a href="/r" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-4); color: var(--color-theme-4);">
								Join Communities
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- AI-Powered Matching -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-5);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-5);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M17.753,14A2.25,2.25 0 0,1 20,16.25C20,17.78 18.78,19 17.25,19H6.75C5.22,19 4,17.78 4,16.25A2.25,2.25 0 0,1 6.25,14H6V10A6,6 0 0,1 12,4A6,6 0 0,1 18,10V14H17.753M16,10A4,4 0 0,0 12,6A4,4 0 0,0 8,10V14H16V10Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">AI-Powered Matching</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Our intelligent algorithm analyzes your interests, location, and preferences to connect you with relevant opportunities.
						</p>
						<div class="text-center">
							<a href="/u" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-5); color: var(--color-theme-5);">
								Find Your Match
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Rich User Profiles -->
				<div class="feature-card group relative overflow-hidden rounded-3xl p-8 transition-all" style="background: transparent; border: 1px solid var(--color-theme-6);">
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
					<div class="relative">
						<div class="mb-6 flex justify-center">
							<div class="rounded-full p-4 shadow-lg" style="background: var(--color-theme-6);">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
									<path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
								</svg>
							</div>
						</div>
						<h3 class="mb-4 text-2xl font-bold text-center" style="color: var(--color-theme-4);">Rich User Profiles</h3>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
							Create compelling profiles that showcase your personality, skills, and interests. Let others discover the real you.
						</p>
						<div class="text-center">
							<a href="/edit_user" class="interactive-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all" style="background: transparent; border: 1px solid var(--color-theme-6); color: var(--color-theme-6);">
								Build Your Profile
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section px-4 py-20 sm:py-12">
		<div class="mx-auto max-w-4xl text-center">
			<div class="cta-content">
				<h2 class="mb-6 text-5xl font-black leading-tight sm:text-3xl" style="color: var(--color-theme-4);">
					Ready to transform your <span style="color: var(--color-theme-1);">local experience</span>?
				</h2>
				<p class="mb-12 text-xl text-gray-600 dark:text-gray-300 sm:text-lg">
					Join a thriving community of creators, entrepreneurs, and connectors.<br>
					Your next great discovery is just one click away.
				</p>
				<button class="pulse-button interactive-btn group relative overflow-hidden rounded-full px-16 py-8 text-2xl font-black transition-all sm:px-12 sm:py-6 sm:text-xl" style="background: transparent; border: 1px solid var(--color-theme-2); color: var(--color-theme-2);" onclick={handleGetStarted}>
					<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"></div>
					<div class="relative flex items-center gap-4">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="sm:w-6 sm:h-6">
							<path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/>
						</svg>
						{data.user ? 'Continue Your Journey' : 'Start Your Journey'}
					</div>
				</button>
			</div>
		</div>
	</section>
</main>