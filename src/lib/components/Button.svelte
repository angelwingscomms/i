&lt;script lang="ts"&gt; let {(on_click,
(text = ''),
(loading = false),
(disabled = false),
(wide = false))} = $props(); &lt;/script&gt; &lt;button
class="btn-primary {wide ? 'btn-wide' : ''}" onclick={on_click}
disabled={loading || disabled}
&gt;
{#if loading}
	&lt;i class="fas fa-spinner fa-spin"&gt;&lt;/i&gt;
{:else}
	{text}
{/if}
&lt;/button&gt;
