<svelte:head>
	<title
		>Apexlinks: Connect with People Just Like You -
		Find Chatrooms & Anonymous Chats</title
	>
	<meta
		name="description"
		content="Connect with people just like you on Apexlinks. Find people and chatrooms that share your interests, values, and beliefs. Enjoy anonymous video and text chats, join group rooms, filter by age, gender, location – all fun and effortless."
	/>
	<meta
		property="og:title"
		content="Apexlinks: Connect with People Just Like You - Anonymous Chats & Rooms"
	/>
	<meta
		property="og:description"
		content="Find people and chatrooms that share your interests, values, and beliefs. Anonymous, filtered connections for video chats, text, and group discussions."
	/>
	<meta property="og:type" content="website" />
	<meta
		property="og:url"
		content="https://apexlinks.com"
	/>
	<meta
		property="og:image"
		content="https://apexlinks.com/og-image.jpg"
	/>
	<meta
		name="twitter:card"
		content="summary_large_image"
	/>
	<meta
		name="twitter:title"
		content="Apexlinks: Connect with People Just Like You"
	/>
	<meta
		name="twitter:description"
		content="Find people and chatrooms that share your interests, values, and beliefs."
	/>
	<meta
		name="keywords"
		content="connect with people, find people, chatrooms, anonymous chats, video chat, text chat, share interests, online connections, group rooms"
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="flex flex-col items-center justify-center px-4 text-center"
>
	<div class="max-w-4xl">
		<h1 class="hero-title mb-4">
			Connect with people just like you
		</h1>
		<p class="hero-subtitle mb-8">
			Start a blog. Create and share posts. Find
			people and chatrooms that share your interests,
			values and beliefs. Connect with people just
			like you through anonymous video or text chats,
			join group discussions, and build real
			connections effortlessly.
		</p>
		<div
			class="flex flex-col justify-center gap-4 sm:flex-row"
		>
			<a href="/posts" class="btn-primary"
				>explore posts</a
			>
			<a href="/r" class="btn-outline"
				>explore chatrooms</a
			>
		</div>
	</div>
	<!-- Static background orbs -->
	<div
		class="hero-background-orb fixed top-20 left-10 h-64 w-64 bg-[var(--color-theme-6)] opacity-20"
	></div>
	<div
		class="hero-background-orb fixed right-10 bottom-20 h-48 w-48 bg-[var(--color-theme-2)] opacity-10"
	></div>
</section>

<!-- Features Section -->
<section class="features-grid py-16">
	<div class="mx-auto max-w-6xl px-4">
		<div class="feature-card">
			<div
				class="feature-icon bg-[var(--color-theme-1)]"
			>
				<i class="fa fa-sticky-note"></i>
			</div>
			<h3 class="feature-title">
				Share Posts to Connect with Your Community
			</h3>
			<p class="feature-description">
				Create and share posts with text, images, and
				updates to engage with people who share your
				interests. Discover community discussions,
				view comments in realtime, follow updates, and
				build connections through shared content.
			</p>
			<a href="/posts" class="feature-link"
				>Explore Posts <i class="fa fa-arrow-right"
				></i></a
			>
		</div>

		<div class="feature-card">
			<div
				class="feature-icon bg-[var(--color-theme-2)]"
			>
				<i class="fa fa-users"></i>
			</div>
			<h3 class="feature-title">
				Create & Join Chatrooms to Connect with People
			</h3>
			<p class="feature-description">
				Connect with people just like you by building
				your own group hangout or joining existing
				chatrooms on topics like gaming, music, or
				random fun. Find people that share your
				interests, values, and beliefs through text or
				video meetings. Invite friends anonymously and
				discover new crews effortlessly.
			</p>
			<a href="/r" class="feature-link"
				>Explore Rooms <i class="fa fa-arrow-right"
				></i></a
			>
		</div>

		<div class="feature-card">
			<div
				class="feature-icon bg-[var(--color-theme-3)]"
			>
				<i class="fa fa-video-camera"></i>
			</div>
			<h3 class="feature-title">
				Video Chat to Find People Nearby
			</h3>
			<p class="feature-description">
				Connect with people just like you via live
				video chats with smart filters for age,
				gender, and location. Find people that share
				your interests and beliefs in seconds. Perfect
				for spontaneous connections – anonymous,
				private, and easy to end anytime.
			</p>
			<a href="/find" class="feature-link"
				>Try Video Chat <i class="fa fa-arrow-right"
				></i></a
			>
		</div>

		<div class="feature-card">
			<div
				class="feature-icon bg-[var(--color-theme-4)]"
			>
				<i class="fa fa-comment"></i>
			</div>
			<h3 class="feature-title">
				Anonymous Text Chats to Share Interests
			</h3>
			<p class="feature-description">
				Find people and start anonymous text chats
				without revealing your identity. Connect with
				people just like you, share thoughts, memes,
				and values in a light, private space. Ideal
				for building connections before video – simple
				and exciting.
			</p>
			<a href="/u" class="feature-link"
				>Find Users <i class="fa fa-arrow-right"
				></i></a
			>
		</div>

		<div class="feature-card">
			<div
				class="feature-icon bg-[var(--color-theme-5)]"
			>
				<i class="fa fa-user"></i>
			</div>
			<h3 class="feature-title">
				Build Profile to Connect with Like-Minded
				People
			</h3>
			<p class="feature-description">
				Create a profile highlighting your interests,
				values, and beliefs, then search nearby to
				find people just like you. Connect through
				filtered matches for chats or events –
				anonymous, location-based, and fully
				customizable.
			</p>
			<a href="/i/create" class="feature-link"
				>Build Profile <i class="fa fa-arrow-right"
				></i></a
			>
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
	</div>
</section>

<!-- Footer -->
<footer
	class="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-8 text-center"
>
	<div class="mx-auto max-w-4xl">
		<p class="mb-4 text-[var(--text-secondary)]">
			Quick jumps to connect with people: <a
				href="/find"
				class="feature-link mx-1"
				>Find Matches & Chatrooms</a
			>
			|
			<a href="/chats" class="feature-link mx-1"
				>Start Anonymous Chats</a
			>
			|
			<a href="/r" class="feature-link mx-1"
				>Create & Join Rooms</a
			>
			|
			<a href="/u" class="feature-link mx-1"
				>Find People Nearby</a
			>
			|
			<a href="/google" class="feature-link mx-1"
				>Sign Up Free</a
			>
			|
			<a href="/privacy" class="feature-link mx-1"
				>Privacy Policy</a
			> – Connect safely and anonymously.
		</p>
		<p class="text-[var(--text-tertiary)]">
			Made for real connections. Join the fun today.
			© 2025 Apexlinks.
		</p>
	</div>
</footer>
