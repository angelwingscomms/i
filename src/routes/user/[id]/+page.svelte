<script lang="ts">
	export let data;

	$: ({ user, comparison, isLoggedIn, isOwnProfile } = data);

	function getSocialMediaName(url: string): string {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com')) return 'Facebook';
			if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
			if (hostname.includes('instagram.com')) return 'Instagram';
			if (hostname.includes('linkedin.com')) return 'LinkedIn';
			if (hostname.includes('github.com')) return 'GitHub';
			if (hostname.includes('youtube.com')) return 'YouTube';
			if (hostname.includes('tiktok.com')) return 'TikTok';
			if (hostname.includes('discord.gg')) return 'Discord';
			if (hostname.includes('pinterest.com')) return 'Pinterest';
			if (hostname.includes('reddit.com')) return 'Reddit';
			if (hostname.includes('spotify.com')) return 'Spotify';
			if (hostname.includes('twitch.tv')) return 'Twitch';
			if (hostname.includes('medium.com')) return 'Medium';
			if (hostname.includes('snapchat.com')) return 'Snapchat';
			if (hostname.includes('telegram.org')) return 'Telegram';
			return new URL(url).hostname.replace('www.', '').split('.')[0]; // Generic name from hostname
		} catch (e) {
			return url; // Fallback to raw URL if parsing fails
		}
	}
</script>

<svelte:head>
	<title>{user.tag} - User Profile</title>
</svelte:head>

<div class="  container">
	<div class="profile-card">
		<header class="profile-header">
			<h1 class="user-tag">{user.tag}</h1>
			<div class="user-meta">
				<span class="user-age">Age: {user.age}</span>
				<span class="user-gender">
					{user.gender === 0 ? 'Male' : 'Female'}
				</span>
			</div>
		</header>

		{#if comparison && isLoggedIn && !isOwnProfile}
			<div class="comparison-section">
				<h2 class="comparison-title">What You Have in Common</h2>
				<div class="comparison-content">
					<p>{comparison}</p>
				</div>
			</div>
		{/if}

		{#if isLoggedIn && !isOwnProfile}
			<!-- <div class="actions">
				<a href="/user/{user.tag}/chat" class="chat-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
						/>
					</svg>
					Start Chat
				</a>
			</div> -->
		{:else if isOwnProfile}
			<div class="actions">
				<a href="/edit_user/{user.tag}" class="edit-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
						/>
					</svg>
					Edit Profile
				</a>
			</div>
		{:else}
			<div class="login-prompt">
				<p>
					Please <a href="/google">log in</a> to see compatibility and start chatting.
				</p>
			</div>
		{/if}

		{#if user.socialLinks && user.socialLinks.length > 0}
			<div class="social-links-section">
				<h3 class="social-links-title">Connect with {user.tag}</h3>
				<div class="social-links-grid">
					{#each user.socialLinks as link}
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							class="social-link"
						>
							{getSocialMediaName(link)}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- <div class="description-section">
			<h3 class="description-title">About {user.tag}</h3>
			<div class="description-content">
				<p>{user.description}</p>
			</div>
		</div> -->
	</div>

	<!-- <div class="navigation">
		<a href="/" class="back-btn">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
			</svg>
			Back to Search
		</a>
	</div> -->
</div>

<style>
	.container {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.profile-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		margin-bottom: 2rem;
	}

	.profile-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #f1f5f9;
	}

	.user-tag {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	.user-meta {
		display: flex;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.user-age,
	.user-gender {
		background: #f8fafc;
		color: #475569;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 500;
		border: 1px solid #e2e8f0;
	}

	.comparison-section {
		margin-bottom: 2rem;
		background: #f0f9ff;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #bae6fd;
	}

	.comparison-title {
		color: #0369a1;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.comparison-title::before {
		content: '🤝';
		font-size: 1.5rem;
	}

	.comparison-content {
		color: #1e40af;
		line-height: 1.6;
	}

	.comparison-content p {
		margin: 0;
	}

	.description-section {
		margin-top: 2rem;
	}

	.description-title {
		color: #374151;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.description-content {
		background: #f8fafc;
		border-radius: 8px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
	}

	.description-content p {
		color: #4b5563;
		line-height: 1.6;
		margin: 0;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.chat-btn,
	.edit-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		background: #2563eb;
		color: white;
		text-decoration: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}

	.chat-btn:hover,
	.edit-btn:hover {
		background: #1d4ed8;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}

	.edit-btn {
		background: #059669;
		box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
	}

	.edit-btn:hover {
		background: #047857;
		box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
	}

	.login-prompt {
		text-align: center;
		padding: 2rem;
		background: #fef3c7;
		border-radius: 8px;
		border: 1px solid #fbbf24;
		margin-bottom: 2rem;
	}

	.login-prompt p {
		margin: 0;
		color: #92400e;
	}

	.login-prompt a {
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 600;
	}

	.login-prompt a:hover {
		text-decoration: underline;
	}

	.navigation {
		display: flex;
		justify-content: center;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #f3f4f6;
		color: #374151;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
		border: 1px solid #d1d5db;
	}

	.back-btn:hover {
		background: #e5e7eb;
		transform: translateX(-2px);
	}

	.social-links-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #f1f5f9;
		text-align: center;
	}

	.social-links-title {
		color: #374151;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.social-links-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #e0f2f7; /* Light blue background */
		color: #0c4a6e; /* Darker blue text */
		border: 1px solid #a7d9ee;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
	}

	.social-link:hover {
		background: #bae6fd; /* Slightly darker blue on hover */
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 640px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.profile-card {
			padding: 1.5rem;
		}

		.user-tag {
			font-size: 2rem;
		}

		.user-meta {
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}

		.comparison-section {
			padding: 1rem;
		}

		.chat-btn,
		.edit-btn {
			padding: 0.875rem 1.5rem;
			font-size: 1rem;
		}

		.social-links-section {
			padding-top: 1.5rem;
		}

		.social-links-grid {
			flex-direction: column;
			align-items: center;
		}

		.social-link {
			width: 100%; /* Make links full width on small screens */
			max-width: 250px; /* Limit max width for better appearance */
			justify-content: center;
		}
	}
</style>




