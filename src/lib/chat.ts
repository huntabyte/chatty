import { writable } from 'svelte/store'

export const chatHistory = writable<{ query: string; answer: string }[]>([])
