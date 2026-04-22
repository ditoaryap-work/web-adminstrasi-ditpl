<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form);
</script>

<svelte:head>
	<title>Login — E-Office Dit. PL</title>
	<meta name="description" content="Sistem Administrasi Perjalanan Dinas Direktorat PL" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
	<Card.Root class="w-full max-w-md shadow-xl">
		<Card.Header class="space-y-3 text-center">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
				<img src="/logo-pertanian.png" alt="Logo Kementerian" class="h-12 w-12 object-contain" />
			</div>
			<Card.Title class="text-2xl font-bold tracking-tight">E-Office Dit. PL</Card.Title>
			<Card.Description>Sistem Administrasi Perjalanan Dinas</Card.Description>
		</Card.Header>

		<Card.Content>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="username" class={$errors.username ? 'text-destructive' : ''}>Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						bind:value={$form.username}
						placeholder="Masukkan username"
						autocomplete="username"
						aria-invalid={$errors.username ? 'true' : undefined}
					/>
					{#if $errors.username}
						<p class="text-[0.8rem] font-medium text-destructive">
							{$errors.username}
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="password" class={$errors.password ? 'text-destructive' : ''}>Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						bind:value={$form.password}
						placeholder="Masukkan password"
						autocomplete="current-password"
						aria-invalid={$errors.password ? 'true' : undefined}
					/>
					{#if $errors.password}
						<p class="text-[0.8rem] font-medium text-destructive">
							{$errors.password}
						</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$submitting}>
					{#if $submitting}
						Memproses...
					{:else}
						Masuk
					{/if}
				</Button>
			</form>
		</Card.Content>

		<Card.Footer class="justify-center text-xs text-muted-foreground">
			&copy; {new Date().getFullYear()} Direktorat Perlindungan Lahan
		</Card.Footer>
	</Card.Root>
</div>
