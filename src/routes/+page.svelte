<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { chatHistory } from '$lib/chat'

	let currentChat = { query: '', answer: '' }
	let loading = false
	let query = ''
	let answer = ''
	let chatMessages: ChatCompletionRequestMessage[] = []
	let currentResponse: ChatCompletionRequestMessage = {
		role: 'assistant',
		content: ''
	}
	let scrollToDiv: HTMLDivElement

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	const handleSubmit = async () => {
		loading = true
		chatMessages.push({ role: 'user', content: query })
		currentChat = { query, answer: '' }

		const eventSource = new SSE(`/api/chat`, {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: [...chatMessages] })
		})

		query = ''

		eventSource.addEventListener('error', handleErr)

		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				loading = false
				if (e.data === '[DONE]') {
					chatHistory.update((ch) => [...ch, currentChat])
					chatMessages.push({ role: 'assistant', content: answer })
					currentChat = { query: '', answer: '' }
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					currentResponse.content = (currentResponse.content ?? '') + delta.content
					currentChat.answer = (currentChat.answer ?? '') + delta.content
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				console.error(err)
				handleErr(err)
			}
		})
		eventSource.stream()
		scrollToBottom()
		loading = true
	}

	function handleErr<T>(err: T) {
		loading = false
		query = ''
		console.error(err)
	}
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
	<h1 class="text-2xl font-bold w-full text-center">Chatty</h1>
	<div class="h-[500px] w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<ChatMessage type="assistant" message="Hi, I'm Axel, how can I help?" />
			{#each $chatHistory as history}
				<ChatMessage type="user" message={history.query} />
				<ChatMessage type="assistant" message={history.answer} />
			{/each}
			{#if currentChat.query}
				<ChatMessage type="user" message={currentChat.query} />
				{#if currentChat.answer}
					<ChatMessage type="assistant" message={currentChat.answer} />
				{/if}
			{/if}
			{#if loading}
				<ChatMessage type="assistant" message="Loading..." />
			{/if}
		</div>
		<div class="" bind:this={scrollToDiv} id="scrollToDiv" />
	</div>
	<form
		class="flex w-full rounded-md gap-4 bg-gray-900 p-4"
		on:submit|preventDefault={() => handleSubmit()}
	>
		<input type="text" class="input input-bordered w-full" bind:value={query} />
		<button type="submit" class="btn btn-accent"> Send </button>
	</form>
</div>
