## Sub-task 1: Homepage Modifications (`i/src/routes/+page.svelte`)

### Micro-tasks:

- [x] Remove the "Reset" button from `i/src/routes/+page.svelte`.
- [x] Create a new Svelte component, e.g., `i/src/lib/components/ui/AuthButton.svelte`, for the "Login w Google" button functionality.
- [x] Implement logic in `AuthButton.svelte` to display "Login w Google" or "Edit Your Profile" based on user authentication status.
- [x] Replace the existing authentication links (`login w Google` and `edit your profile`) in `i/src/routes/+page.svelte` with the new `AuthButton` component.
- [x] Modify the `<p class=\"hero-subtitle\">` text in `i/src/routes/+page.svelte` to include the privacy assurance regarding commonalities.

## Sub-task 2: Edit User Page Modifications (`i/src/routes/edit_user/+page.svelte`)

### Micro-tasks:

- [x] Verify the age input field in `i/src/routes/edit_user/+page.svelte` is already `type=\"number\"`. (It is).
- [x] Adjust the styling for the 'Female' checkbox in `i/src/routes/edit_user/+page.svelte` to make it visually rounded/circular, using custom utility classes if necessary based on `src/app.css`.
- [x] Remove the entire WhatsApp number input `div.form-group` from `i/src/routes/edit_user/+page.svelte`.
- [x] Update the `handleSubmit` function in `i/src/routes/edit_user/+page.svelte` to remove `whatsapp` from the `searchPayload`. (This implies the server-side will also ignore it, but I only modify frontend here).

## Sub-task 3: Description Input Component Modification (`i/src/lib/components/ui/DescriptionInput.svelte`)

### Micro-tasks:

- [x] Comment out the character count display (`<div class={charCount > maxLength ? 'char-count-over' : 'char-count'}>...</div>`) in `i/src/lib/components/ui/DescriptionInput.svelte`.

## Sub-task 4: Sitewide Dark Theme Backgrounds

### Micro-tasks:

- [x] Identify the CSS file responsible for background styles, likely `i/src/app.css`.
- [x] Modify the relevant CSS rules in `i/src/app.css` to set all background elements (`bg-orb`, `main` background, etc.) to full black (`#000000`).
- [x] Review all affected pages and components to ensure text and other elements remain visible and aesthetically pleasing against the black background. Adjust foreground colors and other styles as needed, prioritizing custom utility classes from `src/app.css` to maintain consistency.

## Sub-task 5: Address Frequent Logout Issue

### Micro-tasks:

1.  Investigate how user sessions are managed in the SvelteKit application. Look for relevant code in `+page.svelte` (data loading), potentially `src/hooks.server.ts` or `src/lib/server/auth.ts` if they exist (need to check project structure).
2.  Identify where session cookies or tokens are set and their expiry times.
3.  Formulate a strategy to extend the session validity to at least one year. This may involve modifying cookie `maxAge` or `expires` attributes, or adjusting token refresh mechanisms. If server-side changes are required and outside the scope of direct file modification, I will describe the necessary changes to the user.