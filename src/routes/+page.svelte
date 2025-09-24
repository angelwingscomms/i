<svelte:head>
	<title
		>apexlinks</title
	>
	<meta
		name="description"
		content="easily find products and services you want. discover chatrooms sharing interests. anonymous video/text chats, groups, age/gender/location filters."
	/>
	<meta
		property="og:title"
		content="apexlinks: connect like-minded people"
	/>
	<meta
		property="og:description"
		content="easily find products and services you want. discover chatrooms sharing interests. anonymous video/text chats & groups with filters."
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
		content="apexlinks: connect like-minded people"
	/>
	<meta
		name="twitter:description"
		content="easily find products and services you want. discover chatrooms sharing interests."
	/>
	<meta
		name="keywords"
		content="easily find products and services you want. connect with people, find people, chatrooms, anonymous chats, video chat, text chat, share interests, online connections, group rooms"
	/>
</svelte:head>

<!-- hero section -->
<section
	class="flex flex-col items-center justify-center px-4 pt-16 text-center"
>
	<div class="max-w-4xl">
		<h1 class="hero-title mb-4">
			easily find products and services you want
		</h1>
		<p class="hero-subtitle mb-8">
			discover chatrooms, share posts, and connect anonymously via video/text chats. build real connections effortlessly.
		</p>
		<div
			class="flex flex-col justify-center gap-4 sm:flex-row"
		>
			<Button href="/i" variant="secondary" text="find items" />
			<Button href="/posts" variant="primary" text="explore posts" />
		</div>
	</div>
	<!-- static background orbs -->
	<div
		class="hero-background-orb fixed top-20 left-10 h-64 w-64 bg-[var(--color-theme-6)] opacity-20"
	></div>
	<div
		class="hero-background-orb fixed right-10 bottom-20 h-48 w-48 bg-[var(--color-theme-2)] opacity-10"
	></div>
</section>

<!-- features section -->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import DiscoverItems from '$lib/images/items.png';
	import SharePosts from '$lib/images/posts.png';
	import Chatrooms from '$lib/images/chat.png';
	import VideoChat from '$lib/images/video.png';
	import BuildProfile from '$lib/images/users.png';
</script>

<section class="features-grid py-16">
	<div class="mx-auto max-w-6xl px-4 flex flex-wrap gap-8 justify-center">
		<Card
			themeColor="var(--color-theme-2)"
			title="discover products & services"
			description="browse nearby user offerings. connect with creators and share yours."
			href="/i"
			buttonText="explore items"
			image={DiscoverItems}
			alt="cute 3d render of a shopping bag viewed at 3/4 angle in darker pink-magenta on black background"
		/>

		<Card
			themeColor="var(--color-theme-1)"
			title="share posts"
			description="create posts with text/images. engage in community discussions and build connections."
			href="/posts"
			buttonText="explore posts"
			image={SharePosts}
			alt="cute 3d render of a sticky note viewed at 3/4 angle in darker purple-magenta on black background"
		/>

		<Card
			themeColor="var(--color-theme-2)"
			title="chatrooms"
			description="build or join group chats on shared interests. connect via text/video anonymously."
			href="/r"
			buttonText="explore rooms"
			image={Chatrooms}
			alt="cute 3d render of a chat bubble viewed at 3/4 angle in darker pink-magenta on black background"
		/>

		<Card
			themeColor="var(--color-theme-3)"
			title="video chat"
			description="live video with filters for age/gender/location. find like-minded people quickly."
			href="/find"
			buttonText="try video chat"
			image={VideoChat}
			alt="cute 3d render of a video camera, bright magenta on black background"
		/>

		<Card
			themeColor="var(--color-theme-5)"
			title="connect with like minds"
			description="highlight interests; search nearby for matches. connect anonymously."
			href="/i/create"
			buttonText="build profile"
			image={BuildProfile}
			alt="cute 3d renders of three user avatars in different site theme colors, viewed at 3/4 angle on black background"
		/>

		<!--
	<div class="feature-card animate-on-scroll" style="animation-delay: 0.4s;">
		<div class="feature-icon bg-[var(--color-theme-3)]">
			<i class="fa fa-palette"></i>
		</div>
		<h3 class="feature-title">ai image generator (pink)</h3>
		<p class="feature-description">whip up custom images from prompts or presets – think fun avatars or creative visuals. upload refs for style-matching, generate in a snap. privacy note: your ideas stay yours, no sharing required. get artsy without the hassle.</p>
		<Button href="/pink" class="feature-link">generate images <i class="fa fa-arrow-right"></i></Button>
	</div>
	-->

		<!--
	<div class="feature-card animate-on-scroll" style="animation-delay: 0.5s;">
		<div class="feature-icon bg-[var(--color-theme-6)]">
			<i class="fa fa-play-circle"></i>
		</div>
		<h3 class="feature-title">youtube summarizer</h3>
		<p class="feature-description">search videos, get instant summaries, and chat about them with ai. dive deep without watching hours – ask questions, get insights. fun for learning or debating clips, all in one spot. quick, smart, and zero spoilers if you want.</p>
		<Button href="/tools/youtube-video-summarize-tool" class="feature-link">summarize videos <i class="fa fa-arrow-right"></i></Button>
	</div>
	-->
	</div>
</section>

<!-- footer -->
<footer
	class="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-8 text-center"
>
	<div class="mx-auto max-w-4xl">
		<p class="mb-4 text-[var(--text-secondary)]">
			quick links: <a
				href="/find"
				class="feature-link mx-1"
				>find matches</a
			>
			|
			<a href="/chats" class="feature-link mx-1"
				>anonymous chats</a
			>
			|
			<a href="/r" class="feature-link mx-1"
				>rooms</a
			>
			|
			<a href="/u" class="feature-link mx-1"
				>find nearby</a
			>
			|
			<a href="/google" class="feature-link mx-1"
				>sign up</a
			>
			|
			<a href="/privacy" class="feature-link mx-1"
				>privacy</a
			> – connect safely.
		</p>
		<p class="text-[var(--text-tertiary)]">
			made for real connections. © 2025 apexlinks.
		</p>
	</div>
</footer>
