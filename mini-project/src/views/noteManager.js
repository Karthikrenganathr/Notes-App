import NoteManager from "../controller/noteManager.js";
const noteController = new NoteManager();
export default class noteManagerView {

  expandTitle() {
    const contentDiv = document.querySelector(
      ".notes__creatediv__content .notes__creatediv__content__enter"
    );
    contentDiv.addEventListener("focus", () => {
      const titleDiv = document.querySelector(".notes__creatediv__titlediv");
      const optionsDiv = document.querySelector(
        ".notes__creatediv__createOptionscon"
      );
      titleDiv.style.display = "block";
      optionsDiv.style.display = "block";
    });
  }

  headerPinUnpin() {
    document
      .querySelector(".notes__creatediv__titlediv__pinContainer")
      .addEventListener("click", (event) => {
        const imgElement = event.currentTarget.querySelector("img");
        if (window.createStartPin) {
          imgElement.setAttribute("src", "../../img/note/pin.svg");
          imgElement.setAttribute("alt", "header unpin");
        } else {
          imgElement.setAttribute("src", "../../img/note/unpin.svg");
          imgElement.setAttribute("alt", "header pin");
        }
        window.createStartPin = !window.createStartPin;
      });
  }

  createNoteElement(title, description, id,orderId) {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");
    noteDiv.setAttribute("noteId", id);
    noteDiv.setAttribute("orderId",orderId);
    noteDiv.setAttribute("draggable", "true");
    noteDiv.innerHTML = `
        <div>
        <div class="note__heading">${title}</div>
        <div class="note__imgcontainer">
        <img src="./img/note/pin.svg" alt="unpin image" class="note__imgcontainer__img">
        </div>
        </div>
        <div class="note__mainnote">${description}</div>
        <div class="note__options">
        <img src="./img/note/notification.svg" alt="alert image" class="note__options__img start">
        <img src="./img/note/contact.svg" alt="alert image" class="note__options__img">
        <img src="./img/note/themes.svg" alt="alert image" class="note__options__img">
        <img src="./img/note/photo.svg" alt="alert image" class="note__options__img">
        <img src="./img/note/archive.svg" alt="delete note" class="note__options__img">
        <img src="./img/note/more.svg" alt="alert image" class="note__options__img">
        </div>
                `;
    noteDiv
      .querySelector(".note__mainnote")
      .addEventListener("click", () => this.enlargeView(id));
    noteDiv.addEventListener("dragstart", noteController.handleDragStart);
    noteDiv.addEventListener("dragenter", noteController.handleDragEnter);
    noteDiv.addEventListener("dragover", noteController.handleDragOver);
    noteDiv.addEventListener("dragleave", noteController.handleDragLeave);
    noteDiv.addEventListener("drop", noteController.handleDrop);
    noteDiv.addEventListener("dragend", noteController.handleDragEnd);
    return noteDiv;
  }

  createNote(title, description, result, isPinned) {
    document.querySelector(
      ".notes__creatediv__content .notes__creatediv__content__enter"
    ).value = "";
    document.querySelector(
      ".notes__creatediv__titlediv .notes__creatediv__content__enter"
    ).value = "";
    const titleDiv = document.querySelector(".notes__creatediv__titlediv");
    const optionsDiv = document.querySelector(
      ".notes__creatediv__createOptionscon"
    );
    if (window.createStartPin) {
      const imgElement = document.querySelector(
        ".enlarged__note__imgcontainer__img"
      );
      imgElement.setAttribute("src", "../../img/note/unpin.svg");
      imgElement.setAttribute("alt", "header pin");
      window.createStartPin = false;
    }
    titleDiv.style.display = "none";
    optionsDiv.style.display = "none";
    const noteElement = this.createNoteElement(title, description, result.id,result.orderId);
    if (isPinned) {
      let img = document.querySelector(
        ".notes__creatediv__titlediv__pinContainer img"
      );
      img.setAttribute("src", "../../img/note/pin.svg");
      img.setAttribute("alt", "header unpin");
      if (window.pinnedCount == 0) {
        document.querySelector(".notes__pin").style.display = "inline-block";
      }
      const notesContainer = document.querySelector(".notes__pin__noteCon");
      notesContainer.prepend(noteElement);
      noteElement
        .querySelector(".note__imgcontainer__img")
        .addEventListener(
          "click",
          noteController.unPinNote.bind(null, result.id)
        );
      window.pinnedCount++;
    } else {
      const notesContainer = document.querySelector(".notes__unpin__noteCon");
      notesContainer.prepend(noteElement);
      noteElement
        .querySelector(".note__imgcontainer__img")
        .addEventListener(
          "click",
          noteController.pinNote.bind(null, result.id)
        );
    }
    noteElement
      .querySelector(".note__options img:nth-child(5)")
      .addEventListener(
        "click",
        noteController.archiveNote.bind(null, result.id)
      );
  }

  viewNote(notes) {
    notes.notes.forEach((note) => {
      const noteElement = this.createNoteElement(
        note.title,
        note.text,
        note.id,
        note.orderId,
      );
      if (note.isPinned) {
        if (window.pinnedCount == 0) {
          document.querySelector(".notes__pin").style.display = "inline-block";
        }
        noteElement
          .querySelector(".note__imgcontainer__img")
          ?.setAttribute("src", "./img/note/unpin.svg");
        noteElement
          .querySelector(".note__imgcontainer__img")
          ?.setAttribute("alt", "pin image");
        const notesContainer = document.querySelector(".notes__pin__noteCon");
        notesContainer.prepend(noteElement);
        noteElement
          .querySelector(".note__imgcontainer__img")
          .addEventListener(
            "click",
            noteController.unPinNote.bind(null, note.id)
          );
        window.pinnedCount++;
      } else {
        const notesContainer = document.querySelector(".notes__unpin__noteCon");
        notesContainer.prepend(noteElement);
        noteElement
          .querySelector(".note__imgcontainer__img")
          .addEventListener(
            "click",
            noteController.pinNote.bind(null, note.id)
          );
      }
      noteElement
        .querySelector(".note__options img:nth-child(5)")
        .addEventListener(
          "click",
          noteController.archiveNote.bind(null, note.id)
        );
    });
  }

  enlargeView(id) {
    let noteElement = document.querySelector(`[noteId='${id}']`);
    let hiddenDiv = document.querySelector(".enlarged");
    hiddenDiv.querySelector(".enlarged__note__mainnote").textContent =
      noteElement.querySelector(".note__mainnote").textContent;
    hiddenDiv.querySelector(".enlarged__note__heading").textContent =
      noteElement.querySelector(".note__heading").textContent;
    hiddenDiv.setAttribute("noteId", id);
    hiddenDiv.style.display = "inline-block";
  }
  async restoreMain() {
    const notesDiv = document.querySelector(".notes");
    let response = await fetch("../../src/pages/mainNotes/notes.html");
    let content = await response.text();
    window.pinnedCount = 0;
    notesDiv.innerHTML = content;
    await noteController.viewNote();
    this.expandTitle();
    this.headerPinUnpin();
    noteController.saveNote();
    noteController.closeNote();
  }

}
