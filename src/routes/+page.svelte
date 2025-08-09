<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    const isGuest = !data?.user?.i;
</script>

<main>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>

    <div class="container-main min-h-screen py-12">
        <section class="mb-10 text-center">
            <h1 class="hero-title mb-4">find your people</h1>
            <p class="hero-subtitle">private, interest-based chatrooms with people like you</p>

            {#if isGuest}
                <div class="mt-6 flex flex-wrap justify-center gap-3">
                    <a href="/google" class="btn-pink btn-lg">create an account</a>
                    <a href="/r" class="btn-accent btn-lg">search chatrooms</a>
                    <a href="/u" class="btn-primary btn-lg">search users</a>
                </div>
            {:else}
                <div class="mt-6 flex flex-wrap justify-center gap-3">
                    <a href="/r" class="btn-accent btn-lg">search chatrooms</a>
                    <a href="/u" class="btn-primary btn-lg">search users</a>
                    <a href="/edit_user" class="btn-secondary btn-lg">update profile</a>
                </div>
            {/if}
        </section>

        <section class="mx-auto max-w-5xl">
            <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl p-6" style="background: var(--panel-lilac)">
                    <div class="text-3xl">1</div>
                    <div class="mt-2 text-lg font-medium">join</div>
                    <p class="m-0 text-sm text-[var(--text-secondary)]">make an account and pick a tag</p>
                </div>
                <div class="rounded-2xl p-6" style="background: var(--panel-lilac)">
                    <div class="text-3xl">2</div>
                    <div class="mt-2 text-lg font-medium">edit profile</div>
                    <p class="m-0 text-sm text-[var(--text-secondary)]">add a short description (voice-ok)</p>
                </div>
                <div class="rounded-2xl p-6" style="background: var(--panel-lilac)">
                    <div class="text-3xl">3</div>
                    <div class="mt-2 text-lg font-medium">connect</div>
                    <p class="m-0 text-sm text-[var(--text-secondary)]">join rooms and meet matches</p>
                </div>
            </div>
        </section>
    </div>
</main>
