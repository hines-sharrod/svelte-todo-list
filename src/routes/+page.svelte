<script>
	// @ts-nocheck
	import '../app.scss';
	import TodoList from '../lib/TodoList.svelte';
	import { v4 as uuid } from 'uuid';
	import { onMount, tick } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let todoList;
	let showList = true;

	let todos = [];
	let error = null;
	let isLoading = false;
	let isAdding = false;

	onMount(async () => {
		getTodos();
	});

	const getTodos = () => {
		isLoading = true;

		fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
			.then(async (response) => {
				if (response.ok) {
					todos = await response.json();
				}
			})
			.catch(() => {
				error = 'There was an error loading the todos.';
			})
			.finally(() => {
				isLoading = false;
			});
	};

	async function handleAddTodo(event) {
		event.preventDefault();

		isAdding = true;

		fetch('https://jsonplaceholder.typicode.com/todos?_limit=10', {
			method: 'POST',
			body: JSON.stringify({
				title: event.detail.title,
				completed: false
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			}
		})
			.then(async (response) => {
				const newTodo = await response.json();
				console.log({ ...newTodo, id: uuid() });

				if (response.ok) {
					todos = [...todos, { ...newTodo, id: uuid() }];
				}
			})
			.catch(() => {
				error = 'There was an error adding a todo.';
			})
			.finally(async () => {
				isAdding = false;

				await tick();
				todoList.clearInput();
				todoList.focusInput();
			});
	}

	function handleRemoveTodo(event) {
		const idToDelete = event.detail.id;

		fetch(`https://jsonplaceholder.typicode.com/todos/${idToDelete}`, {
			method: 'DELETE'
		})
			.then((response) => {
				if (response.ok) {
					todos = todos.filter((todo) => todo.id !== idToDelete);
				}
			})
			.catch(() => {
				error = 'There was an error deleting the todo.';
			});
	}

	function handleToggleTodo(event) {
		fetch(`https://jsonplaceholder.typicode.com/todos/${event.detail.id}`, {
			method: 'PATCH',
			body: JSON.stringify({
				completed: event.detail.value
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			}
		})
			.then(async (response) => {
				const patchedTodo = await response.json();

				if (response.ok) {
					todos = todos.map((todo) => {
						if (todo.id === event.detail.id) {
							return { ...patchedTodo };
						}

						return { ...todo };
					});
				}
			})
			.catch(() => {
				error = 'There was an error patching the todo.';
			});
	}
</script>

<div />

<div style="max-width: 800px; padding-top: 1rem; margin: 0 auto">
	<label id="list-toggle">
		<input type="checkbox" bind:checked={showList} />
		Show/Hide list
	</label>
	{#if showList}
		<div transition:fade>
			<div>
				<TodoList
					{todos}
					{isLoading}
					{error}
					{isAdding}
					bind:this={todoList}
					on:addtodo={handleAddTodo}
					on:removetodo={handleRemoveTodo}
					on:toggletodo={handleToggleTodo}
				/>
			</div>
			{#if todos}
				<p>
					Number of Todos: {#key todos.length}<span
							style="display: inline-block;"
							in:fly|local={{ y: -10, duration: 500 }}
							>{todos.length}
						</span>{/key}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	#list-toggle {
		display: block;
		margin-bottom: 1rem;
	}
</style>
