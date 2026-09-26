const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskMessage = document.getElementById("taskMessage");

const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");

const searchInput = document.getElementById("searchInput");

const clearCompleted = document.getElementById("clearCompleted");

const themeBtn = document.getElementById("themeBtn");

const filters = document.querySelectorAll(".filter");


// ===============================
// LOAD SAVED TASKS
// ===============================

let tasks = [];

try {
    const savedTasks = localStorage.getItem("taskflowTasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.log("Could not load saved tasks.");

    tasks = [];
}


// Current filter
let currentFilter = "all";

// Task being edited
let editingTaskId = null;


// ===============================
// SAVE TASKS
// ===============================

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalTasks.textContent = total;

    activeTasks.textContent = active;

    completedTasks.textContent = completed;
}


// ===============================
// GET FILTERED TASKS
// ===============================

function getFilteredTasks() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    return tasks.filter(task => {

        // Search
        const matchesSearch =
            task.text
                .toLowerCase()
                .includes(searchText);


        // Filter
        let matchesFilter = true;


        if (currentFilter === "active") {

            matchesFilter =
                !task.completed;

        }


        if (currentFilter === "completed") {

            matchesFilter =
                task.completed;

        }


        return matchesSearch && matchesFilter;

    });
}


// ===============================
// DISPLAY TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";


    const filteredTasks =
        getFilteredTasks();


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

        taskMessage.textContent =
            tasks.length === 0
                ? "No tasks available."
                : "No matching tasks.";

    } else {

        emptyState.style.display = "none";

        taskMessage.textContent =
            `${filteredTasks.length} task(s) shown.`;

    }


    filteredTasks.forEach(task => {

        const taskElement =
            document.createElement("div");


        taskElement.className = "task";


        if (task.completed) {

            taskElement.classList.add(
                "completed"
            );

        }


        // Checkbox
        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className =
            "task-checkbox";

        checkbox.checked =
            task.completed;


        checkbox.addEventListener(
            "change",
            () => {

                toggleTask(task.id);

            }
        );


        // Information
        const taskInfo =
            document.createElement("div");

        taskInfo.className =
            "task-info";


        const taskName =
            document.createElement("div");

        taskName.className =
            "task-name";

        taskName.textContent =
            task.text;


        const taskMeta =
            document.createElement("div");

        taskMeta.className =
            "task-meta";


        // Priority
        const priority =
            document.createElement("span");

        priority.className =
            `priority ${task.priority}`;

        priority.textContent =
            `${task.priority} Priority`;


        taskMeta.appendChild(priority);


        // Due date
        if (task.dueDate) {

            const date =
                document.createElement("span");

            date.className =
                "due-date";

            date.textContent =
                `📅 ${formatDate(task.dueDate)}`;

            taskMeta.appendChild(date);

        }


        taskInfo.appendChild(taskName);

        taskInfo.appendChild(taskMeta);


        // Actions
        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";


        const editButton =
            document.createElement("button");

        editButton.className =
            "action-btn";

        editButton.textContent =
            "✏️ Edit";

        editButton.type =
            "button";


        editButton.addEventListener(
            "click",
            () => {

                openEditModal(task);

            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "action-btn delete";

        deleteButton.textContent =
            "🗑 Delete";

        deleteButton.type =
            "button";


        deleteButton.addEventListener(
            "click",
            () => {

                deleteTask(task.id);

            }
        );


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        taskElement.appendChild(checkbox);

        taskElement.appendChild(taskInfo);

        taskElement.appendChild(actions);


        taskList.appendChild(taskElement);

    });


    updateStatistics();
}


// ===============================
// ADD TASK
// ===============================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const text =
            taskInput.value.trim();


        if (!text) {

            alert("Please enter a task.");

            taskInput.focus();

            return;

        }


        const newTask = {

            id: Date.now(),

            text: text,

            priority:
                priorityInput.value,

            dueDate:
                dueDateInput.value,

            completed: false

        };


        tasks.push(newTask);


        saveTasks();


        taskForm.reset();


        priorityInput.value =
            "Medium";


        renderTasks();


        taskInput.focus();

    }
);


// ===============================
// COMPLETE / UNCOMPLETE
// ===============================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });


    saveTasks();

    renderTasks();
}


// ===============================
// DELETE TASK
// ===============================

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();
}


// ===============================
// FILTER BUTTONS
// ===============================

filters.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filters.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

});


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    renderTasks
);


// ===============================
// CLEAR COMPLETED
// ===============================

clearCompleted.addEventListener(
    "click",
    () => {

        const completedCount =
            tasks.filter(
                task => task.completed
            ).length;


        if (completedCount === 0) {

            alert(
                "There are no completed tasks."
            );

            return;

        }


        const confirmClear =
            confirm(
                "Clear all completed tasks?"
            );


        if (!confirmClear) {
            return;
        }


        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        renderTasks();

    }
);


// ===============================
// EDIT MODAL
// ===============================

const editModal =
    document.getElementById("editModal");

const editTaskInput =
    document.getElementById("editTaskInput");

const editPriority =
    document.getElementById("editPriority");

const editDueDate =
    document.getElementById("editDueDate");

const saveEdit =
    document.getElementById("saveEdit");

const closeModal =
    document.getElementById("closeModal");


function openEditModal(task) {

    editingTaskId =
        task.id;


    editTaskInput.value =
        task.text;

    editPriority.value =
        task.priority;

    editDueDate.value =
        task.dueDate || "";


    editModal.classList.add(
        "show"
    );

}


function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

    editingTaskId = null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


saveEdit.addEventListener(
    "click",
    () => {

        const newText =
            editTaskInput.value.trim();


        if (!newText) {

            alert(
                "Task name cannot be empty."
            );

            return;

        }


        tasks =
            tasks.map(task => {

                if (
                    task.id ===
                    editingTaskId
                ) {

                    return {

                        ...task,

                        text: newText,

                        priority:
                            editPriority.value,

                        dueDate:
                            editDueDate.value

                    };

                }


                return task;

            });


        saveTasks();

        renderTasks();

        closeEditModal();

    }
);


// Close modal when clicking outside
editModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


// ===============================
// DARK MODE
// ===============================

const savedTheme =
    localStorage.getItem(
        "taskflowTheme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent =
        "☀️ Light";

}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "taskflowTheme",
            isDark
                ? "dark"
                : "light"
        );


        themeBtn.textContent =
            isDark
                ? "☀️ Light"
                : "🌙 Dark";

    }
);


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ===============================
// INITIAL DISPLAY
// ===============================

renderTasks();