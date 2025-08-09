<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { User } from '$lib/types';

    export let is_open: boolean;
    export let user: User | null = null;

    const dispatch = createEventDispatcher();

    function close_sidebar() {
        is_open = false;
        dispatch('close');
    }
</script>

<aside class="mobile-sidebar" class:is-open={is_open}>
    <div class="sidebar-content">
        <button class="close-button" on:click={close_sidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
        <nav class="sidebar-nav">
            {#if user}
                <a href="/r" class="sidebar-nav-link" on:click={close_sidebar}>search chatrooms</a>
                <a href="/u" class="sidebar-nav-link" on:click={close_sidebar}>search users</a>
                <a href="/edit_user" class="sidebar-nav-link" on:click={close_sidebar}>edit profile</a>
                <a href="/u/{user.i}" class="sidebar-nav-link" on:click={close_sidebar}>{user.t}</a>
                <a href="/logout" class="sidebar-nav-link text-error" on:click={close_sidebar}>logout</a>
            {:else}
                <a href="/google" class="sidebar-nav-link" on:click={close_sidebar}>login w Google</a>
            {/if}
        </nav>
    </div>
</aside>

<div class="overlay" class:is-open={is_open} on:click={close_sidebar}></div>

<style>
    .mobile-sidebar {
        position: fixed;
        top: 0;
        right: -300px; /* Hidden by default */
        width: 300px;
        height: 100%;
        background-color: var(--bg-primary);
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
        transition: right 0.3s ease-in-out;
        z-index: 1000;
    }

    .mobile-sidebar.is-open {
        right: 0;
    }

    .sidebar-content {
        padding: 20px;
    }

    .close-button {
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        position: absolute;
        top: 15px;
        right: 15px;
    }

    .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 50px; /* Space for close button */
    }

    .sidebar-nav-link {
        color: var(--text-primary);
        text-decoration: none;
        font-size: 1.1em;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-primary);
    }

    .sidebar-nav-link:hover {
        color: var(--accent-color);
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
    }

    .overlay.is-open {
        opacity: 1;
        visibility: visible;
    }

    /* Hide on larger screens */
    @media (min-width: 768px) {
        .mobile-sidebar,
        .overlay {
            display: none;
        }
    }
</style>
