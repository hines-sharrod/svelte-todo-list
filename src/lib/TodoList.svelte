<svelte:options immutable={true} />

<script>
	// @ts-nocheck

	import Button from './Button.svelte';
	import { createEventDispatcher, afterUpdate } from 'svelte';
	import FaRegTrashAlt from 'svelte-icons/fa/FaRegTrashAlt.svelte';
	import { scale, crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	afterUpdate(() => {
		if (autoscroll) listDiv.scrollTo(0, listDivScrollHeight);
		autoscroll = false;
	});

	export let todos = null;
	export let isLoading = null;
	export let error = null;
	export let isAdding = null;
	let prevTodos = todos;
	let inputText = '';
	let input, listDiv, autoscroll, listDivScrollHeight;

	const dispatch = createEventDispatcher();
	const [send, receive] = crossfade({
		duration: 500,
		fallback: (node) => {
			return scale(node, { start: 0.5, duration: 500 });
		}
	});

	$: {
		autoscroll = todos?.length > prevTodos?.length;
		prevTodos = todos;
	}

	$: activeTodos = todos ? todos.filter((todo) => !todo.completed) : [];
	$: done = todos ? todos.filter((todo) => todo.completed) : [];

	export function clearInput() {
		inputText = '';
	}
	export function focusInput() {
		input.focus();
	}

	function handleAddTodo() {
		const isNotCancelled = dispatch(
			'addtodo',
			{
				title: inputText
			},
			{
				cancelable: true
			}
		);
		if (isNotCancelled) {
			inputText = '';
		}
	}

	function handleRemoveTodo(id) {
		dispatch('removetodo', {
			id
		});
	}

	function handleToggleTodo(id, value) {
		dispatch('toggletodo', {
			id,
			value
		});
	}
</script>

<div class="todo-list-wrapper">
	<div class="todo-list" bind:this={listDiv}>
		<div bind:offsetHeight={listDivScrollHeight}>
			{#if isLoading}
				<p>Loading.....</p>
			{:else if error}
				<p class="no-items-text">{error}</p>
			{:else if todos}
				{#if todos.length === 0}
					<p>Add a todo</p>
				{:else}
					<div style="display: flex; justify-content: space-between;">
						{#each [activeTodos, done] as todoColumn, index}
							<div class="todos-column">
								<h2>{index === 0 ? 'Todos' : 'Done'}</h2>
								<ul>
									{#each todoColumn as { id, title, completed } (id)}
										<li
											animate:flip={{ duration: 300 }}
											in:receive|local={{ key: id }}
											out:send|local={{ key: id }}
											class:completed
										>
											<label>
												<input
													on:input={(event) => {
														event.currentTarget.checked = completed;
														handleToggleTodo(id, !completed);
													}}
													type="checkbox"
													checked={completed}
												/>
												{title}
											</label>
											<button
												class="remove-todo-button"
												aria-label="Remove todo: {title}"
												on:click={() => handleRemoveTodo(id)}
											>
												<span style:width="10px" style:display="inline-block">
													<FaRegTrashAlt />
												</span>
											</button>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
	<form class="add-todo-form" on:submit|preventDefault={handleAddTodo}>
		<input bind:this={input} bind:value={inputText} placeholder="New Todo" disabled={isAdding} />
		<Button class="add-todo-button" type="submit" disabled={!inputText | isAdding}>Add</Button>
	</form>
</div>

<style lang="scss">
	.todo-list-wrapper {
		background-color: #424242;
		border: 1px solid #4b4b4b;
		.no-items-text {
			margin: 0;
			padding: 15px;
			text-align: center;
		}
		.todo-list {
			max-height: 30rem;
			overflow: auto;
			ul {
				margin: 0;
				padding: 10px;
				list-style: none;
				li {
					margin-bottom: 5px;
					display: flex;
					align-items: center;
					background-color: #303030;
					border-radius: 5px;
					padding: 10px;
					position: relative;
					label {
						cursor: pointer;
						font-size: 18px;
						display: flex;
						align-items: baseline;
						padding-right: 20px;
						input[type='checkbox'] {
							margin: 0 10px 0 0;
							cursor: pointer;
						}
					}
					&.completed > label {
						opacity: 0.5;
						text-decoration: line-through;
					}
					.remove-todo-button {
						border: none;
						background: none;
						padding: 5px;
						position: absolute;
						right: 10px;
						cursor: pointer;
						display: none;
						:global(svg) {
							fill: #bd1414;
						}
					}
					&:hover {
						.remove-todo-button {
							display: block;
						}
					}
				}
			}
		}
		.add-todo-form {
			padding: 15px;
			background-color: #303030;
			display: flex;
			flex-wrap: wrap;
			border-top: 1px solid #4b4b4b;
			input {
				flex: 1;
				background-color: #424242;
				border: 1px solid #4b4b4b;
				padding: 10px;
				color: #fff;
				border-radius: 5px;
				margin-right: 10px;
			}
		}

		.todos-column {
			width: 100%;

			h2 {
				margin: 0.5rem 0;
			}

			h2,
			ul {
				padding: 0 1rem;
			}
		}
	}
</style>
