/*
    Kanban Board Script

    This script handles:
    - Creating tasks
    - Drag and drop
    - Editing tasks
    - Deleting tasks
    - Saving tasks to localStorage
    - Loading tasks from localStorage
    - Updating task counts
*/


const columns = document.querySelectorAll(".task-column");
const addTaskBtn = document.querySelector("#addTaskBtn");

const modal = document.querySelector("#taskModal");
const createBtn = document.querySelector("#createTask");
const closeBtn = document.querySelector("#closeModal");

const titleInput = document.querySelector("#taskTitle");
const descInput = document.querySelector("#taskDesc");
const priorityInput = document.querySelector("#taskPriority");
const dateInput = document.querySelector("#taskDate");

let draggedTask = null;


/*
    Function to create a task card
*/
function createTask(title, desc, priority, date){

    const task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("draggable","true");

    task.innerHTML = `
        <h3>${title}</h3>
        <p>${desc}</p>
        <span class="priority ${priority}">${priority}</span>
        <small>Due: ${date || "No date"}</small>
        <button class="delete">Delete</button>
    `;

    addDragEvents(task);

    return task;
}


/*
    Drag events for task
*/
function addDragEvents(task){

    task.addEventListener("dragstart",()=>{
        draggedTask = task;
    });

}


/*
    Column drag events
*/
columns.forEach(column => {

    column.addEventListener("dragover",(e)=>{
        e.preventDefault();
    });

    column.addEventListener("dragenter",()=>{
        column.classList.add("hover");
    });

    column.addEventListener("dragleave",()=>{
        column.classList.remove("hover");
    });

    column.addEventListener("drop",()=>{

        column.classList.remove("hover");

        if(draggedTask){
            column.appendChild(draggedTask);
            draggedTask = null;
            updateCounts();
            saveTasks();
        }

    });

});


/*
    Delete task using event delegation
*/
document.addEventListener("click",(e)=>{

    if(e.target.classList.contains("delete")){
        if(confirm("Delete this task?")){
            e.target.parentElement.remove();
            updateCounts();
            saveTasks();
        }
        
    }

});


/*
    Edit task when double clicked
*/
document.addEventListener("dblclick",(e)=>{

    const task = e.target.closest(".task");

    if(!task) return;

    const newTitle = prompt("Edit title",task.querySelector("h3").innerText);

    if(newTitle){
        task.querySelector("h3").innerText = newTitle.trim()
        saveTasks();
    }

});


/*
    Open modal to create task
*/
addTaskBtn.addEventListener("click",()=>{
    modal.classList.remove("hidden");
});

/*
    Enter key creates task
*/

titleInput.addEventListener("keypress",(e)=>{

    if(e.key === "Enter"){
        createBtn.click();
    }
});

/*
    Close modal
*/
closeBtn.addEventListener("click",()=>{
    modal.classList.add("hidden");
});


/*
    Create task from modal
*/
createBtn.addEventListener("click",()=>{

    const title = titleInput.value;
    const desc = descInput.value || "No description";
    const priority = priorityInput.value;
    const date = dateInput.value;

    if(!title) return;

    const task = createTask(title,desc,priority,date);

    document.querySelector("#todo").appendChild(task);

    updateCounts();
    saveTasks();

    modal.classList.add("hidden");

    titleInput.value="";
    descInput.value="";
});


/*
    Update task count in each column
*/
function updateCounts(){

    columns.forEach(column => {

        const count = column.querySelectorAll(".task").length;

        column.querySelector(".count").textContent = count;

    });

}


/*
    Save tasks to localStorage
*/
function saveTasks(){

    const data = {};

    columns.forEach(column=>{

        const id = column.id;
        data[id] = [];

        column.querySelectorAll(".task").forEach(task=>{

            data[id].push({
                title: task.querySelector("h3").innerText,
                desc: task.querySelector("p").innerText,
                priority: task.querySelector(".priority").innerText,
                date: task.querySelector("small").innerText.replace("Due: ","")
            });

        });

    });

    localStorage.setItem("kanban-data",JSON.stringify(data));
}


/*
    Load tasks from localStorage
*/
function loadTasks(){

    const saved = JSON.parse(localStorage.getItem("kanban-data"));

    if(!saved) return;

    Object.keys(saved).forEach(columnId=>{

        const column = document.getElementById(columnId);

        saved[columnId].forEach(taskData=>{

            const task = createTask(
                taskData.title,
                taskData.desc,
                taskData.priority,
                taskData.date
            );

            column.appendChild(task);

        });

    });

    updateCounts();
}


loadTasks();