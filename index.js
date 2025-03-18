document.addEventListener("DOMContentLoaded", function () {
    const notesContainer = document.getElementById("notesList");
    const saveButton = document.getElementById("saveNote");
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");

    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const updateButton = document.getElementById("updateNote");
    let editingNoteId = null;

    // 🔹 Fungsi untuk mengambil dan menampilkan catatan dari backend
    function fetchNotes() {
        fetch("http://localhost:5000/notes")
            .then(response => response.json())
            .then(data => {
                notesContainer.innerHTML = "";
                data.forEach(note => {
                    const noteCard = document.createElement("div");
                    noteCard.classList.add("card", "mb-3", "text-bg-info", "shadow-lg");
                    noteCard.style.maxWidth = "18rem"; // Membatasi lebar card maksimal 18rem
                    noteCard.style.flex = "1 1 auto"; // Agar tetap fleksibel dan wrap jika penuh

                    noteCard.innerHTML = `
                        <div class="card-header fw-bold d-flex justify-content-between align-items-center">
                            <span>${note.title}</span>
                            <div>
                                <button class="btn btn-warning btn-sm me-1 edit-btn" data-id="${note.id}" data-title="${note.title}" data-content="${note.content}">
                                    ✏
                                </button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${note.id}">
                                    🗑
                                </button>
                            </div>
                        </div>
                        <div class="card-body" style="max-height: 150px; overflow-y: auto;">
                            <p class="card-text">${note.content}</p>
                        </div>
                    `;

                    notesContainer.appendChild(noteCard);
                });


                // 🔹 Event listener untuk tombol hapus
                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const noteId = this.getAttribute("data-id");
                        deleteNote(noteId);
                    });
                });

                // 🔹 Event listener untuk tombol edit
                document.querySelectorAll(".edit-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        editingNoteId = this.getAttribute("data-id");
                        editTitle.value = this.getAttribute("data-title");
                        editContent.value = this.getAttribute("data-content");

                        editModal.show(); // Tampilkan modal edit
                    });
                });
            })
            .catch(error => console.error("Error fetching notes:", error));
    }

    fetchNotes(); // Panggil saat halaman dimuat

    // 🔹 Fungsi untuk menambahkan catatan baru
    saveButton.addEventListener("click", function () {
        const title = titleInput.value;
        const content = contentInput.value;

        if (!title || !content) {
            alert("Judul dan isi catatan tidak boleh kosong!");
            return;
        }

        fetch("http://localhost:5000/create-notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content
                })
            })
            .then(response => response.json())
            .then(() => {
                fetchNotes();
                titleInput.value = "";
                contentInput.value = "";
                bootstrap.Modal.getInstance(document.getElementById("exampleModal")).hide();
            })
            .catch(error => console.error("Error adding note:", error));
    });

    // 🔹 Fungsi untuk mengupdate catatan
    updateButton.addEventListener("click", function () {
        if (!editingNoteId) return;

        const updatedTitle = editTitle.value;
        const updatedContent = editContent.value;

        if (!updatedTitle || !updatedContent) {
            alert("Judul dan isi tidak boleh kosong!");
            return;
        }

        fetch(`http://localhost:5000/update-notes/${editingNoteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: updatedTitle,
                    content: updatedContent
                })
            })
            .then(response => response.json())
            .then(() => {
                fetchNotes();
                editModal.hide();
            })
            .catch(error => console.error("Error updating note:", error));
    });

    // 🔹 Fungsi untuk menghapus catatan
    function deleteNote(id) {
        fetch(`http://localhost:5000/delete-notes/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(() => fetchNotes())
            .catch(error => console.error("Error deleting note:", error));
    }
});