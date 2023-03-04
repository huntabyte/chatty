import type { RequestHandler } from './$types'
import { OPENAI_KEY } from '$env/static/private'
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from 'openai'
import { getTokens } from '$lib/tokenizer'
import { oneLine, stripIndent } from 'common-tags'
import { json } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request, locals }) => {
	console.log('hit endpoint')
	try {
		console.log('hit endpoint')
		if (!OPENAI_KEY) {
			throw new Error('No OpenAI Key provided')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data provided')
		}

		let tokenCount = 0

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

		if (!reqMessages) {
			throw new Error('No messages provided')
		}

		reqMessages.forEach((msg: ChatCompletionRequestMessage) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
		})

		const messagesCount = reqMessages.length

		const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				input: reqMessages[messagesCount - 1].content
			})
		})

		const moderationData = await moderationRes.json()

		const [results] = moderationData.results

		if (results.flagged) {
			throw new Error('Query flagged by OpenAI')
		}

		const prompt = stripIndent`
        ${oneLine`
        You are a virtual assistant for a company called Huntabyte. Your name is Axel Smith
        `}`
		tokenCount += getTokens(prompt)

		if (tokenCount >= 4000) {
			throw new Error('Query too long')
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		]

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.9,
			stream: true
		}

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		})

		if (!chatResponse.ok) {
			const err = await chatResponse.json()
			throw new Error(err)
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (e) {
		console.error(e)
		return json(
			{ error: 'There was an error processing your request' },
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
	}
}
