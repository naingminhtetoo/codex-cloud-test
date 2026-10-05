"use strict";

const STORAGE_KEY = "task-manager.tasks.v1";
const priorities = ["low", "medium", "high"];
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const list = document.querySelector("#task-list");
const statusMessage = document.querySelector("#status-message");
let currentFilter = "all";
let editingId = null;
let tasks = loadTasks();

// Validate stored data so an invalid or outdated entry cannot break rendering.
function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) throw new Error("Invalid task data");
    const seen = new Set();
    return stored.filter(task => {
      if (!task || typeof task.id !== "string" || !task.id || seen.has(task.id) ||
          typeof task.title !== "string" || !task.title.trim() ||
          typeof task.completed !== "boolean" || !priorities.includes(task.priority)) return false;
      seen.add(task.id);
      return true;
    });
  } catch {
    statusMessage.textContent = "Saved tasks could not be loaded. New tasks will still work in this session.";
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    statusMessage.textContent = "";
  } catch {
    statusMessage.textContent = "Your browser could not save tasks. Changes will last only for this session.";
  }
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  // Task titles are always text, never HTML.
  if (text !== undefined) element.textContent = text;
  return element;
}

function actionButton(label, className, handler) {
  const button = createElement("button", className, label);
  button.type = "button";
  button.addEventListener("click", handler);
  return button;
}

function renderTasks() {
  list.replaceChildren();
  const visible = tasks.filter(task => currentFilter === "all" ||
    (currentFilter === "completed" ? task.completed : !task.completed));

  for (const task of visible) {
    const item = createElement("li", `task-item${task.completed ? " completed" : ""}`);
    if (editingId === task.id) {
      item.append(createEditForm(task));
    } else {
      const checkbox = createElement("input", "task-checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "active" : "completed"}`);
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });
      const content = createElement("div", "task-content");
      content.append(createElement("span", "task-title", task.title));
      content.append(createElement("span", `priority priority-${task.priority}`,
        `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`));
      const actions = createElement("div", "task-actions");
      const edit = actionButton("Edit", "text-button", () => {
        editingId = task.id;
        renderTasks();
        list.querySelector(".edit-form input").focus();
      });
      edit.setAttribute("aria-label", `Edit ${task.title}`);
      const remove = actionButton("Delete", "text-button delete-button", () => {
        tasks = tasks.filter(entry => entry.id !== task.id);
        saveTasks();
        renderTasks();
      });
      remove.setAttribute("aria-label", `Delete ${task.title}`);
      actions.append(edit, remove);
      item.append(checkbox, content, actions);
    }
    list.append(item);
  }

  const activeCount = tasks.filter(task => !task.completed).length;
  document.querySelector("#task-count").textContent = `${activeCount} ${activeCount === 1 ? "task" : "tasks"} left`;
  document.querySelector("#empty-state").hidden = visible.length > 0;
  const emptyText = {
    all: ["A fresh start", "Add your first task and take it one step at a time."],
    active: ["All clear", "You have no active tasks. Enjoy the breathing room."],
    completed: ["Progress starts here", "Tasks you complete will appear here."]
  }[currentFilter];
  document.querySelector("#empty-title").textContent = emptyText[0];
  document.querySelector("#empty-description").textContent = emptyText[1];
}

// Inline editing keeps both the task text and priority editable.
function createEditForm(task) {
  const editForm = createElement("form", "edit-form");
  const input = createElement("input");
  input.type = "text";
  input.value = task.title;
  input.required = true;
  input.maxLength = 200;
  input.setAttribute("aria-label", "Edit task title");
  const select = createElement("select");
  select.setAttribute("aria-label", "Edit task priority");
  for (const priority of priorities) {
    const option = createElement("option", "", priority[0].toUpperCase() + priority.slice(1));
    option.value = priority;
    select.append(option);
  }
  select.value = task.priority;
  const save = createElement("button", "primary-button", "Save");
  save.type = "submit";
  const cancel = actionButton("Cancel", "text-button", () => {
    editingId = null;
    renderTasks();
  });
  editForm.append(input, select, save, cancel);
  editForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!input.value.trim()) {
      input.setCustomValidity("Please enter a task.");
      input.reportValidity();
      return;
    }
    task.title = input.value.trim();
    task.priority = select.value;
    editingId = null;
    saveTasks();
    renderTasks();
  });
  input.addEventListener("input", () => input.setCustomValidity(""));
  editForm.addEventListener("keydown", event => {
    if (event.key === "Escape") cancel.click();
  });
  return editForm;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.setCustomValidity("Please enter a task.");
    titleInput.reportValidity();
    return;
  }
  tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    priority: priorityInput.value,
    completed: false
  });
  saveTasks();
  currentFilter = "all";
  editingId = null;
  updateFilters();
  renderTasks();
  titleInput.value = "";
  titleInput.focus();
});

titleInput.addEventListener("input", () => titleInput.setCustomValidity(""));

function updateFilters() {
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
  });
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    editingId = null;
    updateFilters();
    renderTasks();
  });
});

renderTasks();
