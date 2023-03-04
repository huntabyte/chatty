<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
	<div>
		<h1 class="text-2xl font-bold w-full text-center">Chatty</h1>
		<p class="text-sm italic">Powered by gpt-3.5-turbo</p>
	</div>
	<div class="h-[500px] w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<ChatMessage type="assistant" message="Hi, I'm Axel, how can I help?" />
			<ChatMessage type="user" message="Hi" />
			<ChatMessage type="assistant" message="Do you need something??" />
			<ChatMessage type="user" message="Woah lose the attitude" />
		</div>
		<div class="" />
	</div>
	<form class="flex w-full rounded-md gap-4 bg-gray-900 p-4">
		<input type="text" class="input input-bordered w-full" />
		<button type="submit" class="btn btn-accent"> Send </button>
	</form>
</div>
