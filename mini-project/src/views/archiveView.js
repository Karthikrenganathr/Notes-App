export default class archiveView {

  constructor() {
    import("/src/controller/archiveController.js").then((module) => {
      this.archiveManager = new module.default();
    });
  }

  viewArchive(archiveNotes) {
    console.log("check", archiveNotes);
    let containerDiv = document.querySelector(".notes__archive__noteCon");
    archiveNotes.notes.forEach((note) => {
      const newNote = this.createNote(note.title, note.text, note.id);
      containerDiv.prepend(newNote);
      newNote
        .querySelector(".note__options img:nth-child(1)")
        .addEventListener(
          "click",
          this.archiveManager.permanentDelte.bind(null, note.id)
        );
      newNote
        .querySelector(".note__options img:nth-child(2)")
        .addEventListener(
          "click",
          this.archiveManager.restore.bind(null, note.id)
        );
    });
  }

  createNote(title, description, id) {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");
    noteDiv.setAttribute("noteId", id);
    noteDiv.innerHTML = `
            <div>
                <div class="note__heading">${title}</div>
            </div>
            <div class="note__mainnote">${description}</div>
            <div class="note__options">
                <img src="../../img/delete notes/permanet delete.svg" alt="permanent delete" class="note__options__img start">
                <img src="../../img/delete notes/reestore.svg" alt="restore" class="note__options__img">
            </div>
        `;
    return noteDiv;
  }
  
}
