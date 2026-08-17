const searchInput = document.getElementById("searchInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesContainer = document.querySelector(".notes-container");

let notes = JSON.parse(localStorage.getItem("notexNotes")) || [];
let deletedNote = null;
let undoTimeout = null;

const colors = ["yellow", "blue", "green", "pink", "purple"];

function saveNotes() {
    localStorage.setItem("notexNotes", JSON.stringify(notes));
}

function showUndo() {
    let undoBar = document.getElementById("undoBar");

    if (!undoBar) {
        undoBar = document.createElement("div");
        undoBar.id = "undoBar";
        undoBar.innerHTML = `
            <span>Note deleted</span>
            <button id="undoBtn" type="button">Undo</button>
        `;
        document.body.appendChild(undoBar);

        document.getElementById("undoBtn").addEventListener("click", function () {
            if (deletedNote) {
                notes.splice(deletedNote.index, 0, deletedNote.note);
                saveNotes();
                renderNotes();

                deletedNote = null;
                undoBar.remove();

                clearTimeout(undoTimeout);
            }
        });
    }

    clearTimeout(undoTimeout);

    undoTimeout = setTimeout(function () {
        deletedNote = null;
        if (undoBar) {
            undoBar.remove();
        }
    }, 5000);
}

function createNoteElement(note) {
    const noteBox = document.createElement("div");

    noteBox.className = `note ${note.color || "yellow"}`;

    noteBox.innerHTML = `
        <button class="pin-note" title="Pin note" type="button">
            <span class="pin-icon">${note.pinned ? "📌" : "📍"}</span>
        </button>

        <button class="delete-note" title="Delete note" type="button">
            <span class="trash-icon"></span>
        </button>

        <div class="color-picker">
            <button type="button" class="color-btn yellow-btn" data-color="yellow" title="Yellow"></button>
            <button type="button" class="color-btn blue-btn" data-color="blue" title="Blue"></button>
            <button type="button" class="color-btn green-btn" data-color="green" title="Green"></button>
            <button type="button" class="color-btn pink-btn" data-color="pink" title="Pink"></button>
            <button type="button" class="color-btn purple-btn" data-color="purple" title="Purple"></button>
        </div>

        <input
            type="text"
            class="note-title"
            placeholder="Note title..."
            value="${note.title}"
        >

        <textarea
            class="note-text"
            placeholder="Write your note..."
        >${note.text}</textarea>
    `;

    const pinBtn = noteBox.querySelector(".pin-note");
    const deleteBtn = noteBox.querySelector(".delete-note");
    const title = noteBox.querySelector(".note-title");
    const text = noteBox.querySelector(".note-text");
    const colorButtons = noteBox.querySelectorAll(".color-btn");

    pinBtn.addEventListener("click", function () {
        note.pinned = !note.pinned;
        saveNotes();
        renderNotes();
    });

    deleteBtn.addEventListener("click", function () {
        const index = notes.indexOf(note);

        if (index !== -1) {
            deletedNote = {
                note: note,
                index: index
            };

            notes.splice(index, 1);
            saveNotes();
            renderNotes();
            showUndo();
        }
    });

    colorButtons.forEach(button => {
        button.addEventListener("click", function () {
            note.color = button.dataset.color;
            noteBox.className = `note ${note.color}`;
            saveNotes();
        });
    });

    title.addEventListener("input", function () {
        note.title = title.value;
        saveNotes();
    });

    text.addEventListener("input", function () {
        note.text = text.value;
        saveNotes();
    });

    notesContainer.appendChild(noteBox);
}

function renderNotes() {
    notesContainer.innerHTML = "";

    const sortedNotes = [...notes].sort((a, b) => {
        return Number(b.pinned) - Number(a.pinned);
    });

    sortedNotes.forEach(createNoteElement);

    const noteCounter = document.getElementById("noteCounter");

    if (noteCounter) {
        const totalNotes = notes.length;
        const pinnedNotes = notes.filter(note => note.pinned).length;

        noteCounter.textContent =
            `${totalNotes} Notes • ${pinnedNotes} Pinned`;
    }
}

searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase().trim();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.text.toLowerCase().includes(query)
    );

    notesContainer.innerHTML = "";

    filteredNotes.forEach(createNoteElement);
});

addNoteBtn.addEventListener("click", function () {
    const newNote = {
        title: "",
        text: "",
        color: colors[notes.length % colors.length],
        pinned: false
    };

    notes.push(newNote);
    saveNotes();
    renderNotes();
});

renderNotes();

const darkModeBtn = document.getElementById("darkModeBtn");

let darkMode = localStorage.getItem("notexDarkMode") === "true";

function updateDarkMode() {
    if (darkMode) {
        document.body.classList.add("dark-mode");
        darkModeBtn.textContent = "☀️ Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        darkModeBtn.textContent = "🌙 Dark Mode";
    }
}

darkModeBtn.addEventListener("click", function () {
    darkMode = !darkMode;

    localStorage.setItem("notexDarkMode", darkMode);

    updateDarkMode();
});

updateDarkMode();