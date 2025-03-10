import * as model from "../model/model.js";
let noteView;

import("/src/views/noteManager.js").then((module) => {
  noteView = new module.default();
});

export default class noteManagerController {
  constructor() {
    this.pinNote = this.pinNote.bind(this);
    this.unPinNote = this.unPinNote.bind(this);
  }

  saveNote() {
    document
      .querySelector(".notes__creatediv__createOptionscon__closecon")
      .addEventListener("click", async () => {
        let content = document.querySelector(
          ".notes__creatediv__content .notes__creatediv__content__enter"
        ).value;
        let title = document.querySelector(
          ".notes__creatediv__titlediv .notes__creatediv__content__enter"
        ).value;
        let isPinned = window.createStartPin;
        let result = await model.storeNotes(title, content, isPinned);
        noteView.createNote(title, content, result, isPinned);
      });
  }

  async viewNote() {
    let userDetail = await model.getNotes();
    noteView.viewNote(userDetail);
  }

  closeNote() {
    document
      .querySelector(".enlarged__note__options__close")
      .addEventListener("click", async () => {
        let englargedNote = document.querySelector(".enlarged");
        let title = englargedNote.querySelector(
          ".enlarged__note__heading"
        ).textContent;
        let content = englargedNote.querySelector(
          ".enlarged__note__mainnote"
        ).textContent;
        let id = englargedNote.getAttribute("noteId");
        let result = await model.updateNotes(title, content, id);
        let selectedNote = document.querySelector(`.note[noteId="${id}"]`);
        selectedNote.querySelector(".note__mainnote").textContent =
          englargedNote.querySelector(".enlarged__note__mainnote").textContent;
        selectedNote.querySelector(".note__heading").textContent =
          englargedNote.querySelector(".enlarged__note__heading").textContent;
        englargedNote.removeAttribute("noteId");
        englargedNote.style.display = "none";
      });
  }

  async archiveNote(id) {
    let noteElement = document.querySelector(`[noteid='${id}']`);
    let noteImg = noteElement.querySelector(".note__imgcontainer__img");
    let noteImgAlt = noteImg ? noteImg.getAttribute("alt") : null;
    if (noteImgAlt === "pin image") {
      window.pinnedCount--;
      if (window.pinnedCount === 0) {
        document.querySelector(".notes__pin").style.display = "none";
      }
    }
    let result = await model.archiveNote(id);
    noteElement.remove();
  }

  async pinNote(id) {
    let noteElement = document.querySelector(`[noteId='${id}']`);
    let noteImg = noteElement.querySelector(".note__imgcontainer__img");
    let result = await model.pinUnpinNode(id, true);
    noteElement.setAttribute("orderId", result.orderId);
    if (window.pinnedCount === 0) {
      document.querySelector(".notes__pin").style.display = "inline-block";
    }
    window.pinnedCount++;
    noteImg.src = "../../img/note/unpin.svg";
    noteImg.alt = "pin image";
    document.querySelector(".notes__pin__noteCon").prepend(noteElement);
    let newNoteImg = noteImg.cloneNode(true);
    noteImg.replaceWith(newNoteImg);
    newNoteImg.addEventListener("click", () => this.unPinNote(id));
  }

  async unPinNote(id) {
    let noteElement = document.querySelector(`[noteId='${id}']`);
    let noteImg = noteElement.querySelector(".note__imgcontainer__img");
    let result = await model.pinUnpinNode(id, false);
    noteElement.setAttribute("orderId", result.orderId);
    window.pinnedCount--;
    if (window.pinnedCount === 0) {
      document.querySelector(".notes__pin").style.display = "none";
    }
    noteImg.src = "../../img/note/pin.svg";
    noteImg.alt = "unpin image";
    document.querySelector(".notes__unpin__noteCon").prepend(noteElement);
    let newNoteImg = noteImg.cloneNode(true);
    noteImg.replaceWith(newNoteImg);
    newNoteImg.addEventListener("click", () => this.pinNote(id));
  }

  async MainPage() {
    const mainClick = document.querySelector(
      ".sidesection__container:nth-child(1)"
    );
    mainClick.addEventListener("click", async function () {
      if (window.currentPage !== "mainPage") {
        if (!navigator.onLine) {
          alert("You are offline cannt switch page");
          return;
        }
        mainClick.style.backgroundColor = "rgba(255, 235, 59, 0.4)";
        mainClick.addEventListener("mouseover", () => {
          mainClick.style.backgroundColor = "lightgray";
        });

        mainClick.addEventListener("mouseout", () => {
          mainClick.style.backgroundColor = "rgba(255, 235, 59, 0.4)";
        });
        const archive = document.querySelector(
          ".sidesection__container:nth-child(2)"
        );
        archive.style.backgroundColor = "transparent";
        archive.addEventListener("mouseover", () => {
          archive.style.backgroundColor = "lightgray";
        });
        archive.addEventListener("mouseout", () => {
          archive.style.backgroundColor = "white";
        });
        noteView.restoreMain();
        window.currentPage = "mainPage";
      }
    });
  }

  search() {
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    }
    function getNotes() {
      return Array.from(document.querySelectorAll(".note")).map((note) => ({
        id: note.getAttribute("noteId"),
        titleWords: note
          .querySelector(".note__heading")
          .textContent.toLowerCase()
          .split(" "),
        textWords: note
          .querySelector(".note__mainnote")
          .textContent.toLowerCase()
          .split(" "),
      }));
    }
    async function searchNotesParallel(notesArray, searchWords) {
      return Promise.allSettled(
        notesArray.map((note) => searchSingleNote(note, searchWords))
      ).then((results) =>
        results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
      );
    }
    function searchSingleNote(note, searchWords) {
      return new Promise((resolve) => {
        if (!window.searchResultsCache) window.searchResultsCache = {};
        let cachedResult = window.searchResultsCache[note.id] || {
          trueSearchWords: [],
          falseSearchWords: [],
        };
        if (
          searchWords.some((word) =>
            cachedResult.falseSearchWords.includes(word)
          )
        ) {
          resolve({
            noteId: note.id,
            trueSearchWords: cachedResult.trueSearchWords,
            falseSearchWords: cachedResult.falseSearchWords,
            isMatch: false,
          });
          return;
        }
        let newTrueSearchWords = [],
          newFalseSearchWords = [];
        let wordsToCheck = searchWords.filter(
          (word) =>
            !cachedResult.trueSearchWords.includes(word) &&
            !cachedResult.falseSearchWords.includes(word)
        );
        wordsToCheck.forEach((word) => {
          if (
            note.titleWords.some((titleWord) => titleWord.includes(word)) ||
            note.textWords.some((textWord) => textWord.includes(word))
          )
            newTrueSearchWords.push(word);
          else newFalseSearchWords.push(word);
        });
        let finalTrueSearchWords = [
          ...cachedResult.trueSearchWords.filter((word) =>
            searchWords.includes(word)
          ),
          ...newTrueSearchWords,
        ];
        let finalFalseSearchWords = [
          ...cachedResult.falseSearchWords.filter((word) =>
            searchWords.includes(word)
          ),
          ...newFalseSearchWords,
        ];
        let isMatch = finalFalseSearchWords.length === 0;

        window.searchResultsCache[note.id] = {
          trueSearchWords: finalTrueSearchWords,
          falseSearchWords: finalFalseSearchWords,
          isMatch: isMatch,
        };
        resolve({
          noteId: note.id,
          trueSearchWords: finalTrueSearchWords,
          falseSearchWords: finalFalseSearchWords,
          isMatch: isMatch,
        });
      });
    }
    async function handleSearch(event) {
      const searchText = event.target.value.trim();
      if (
        !Array.isArray(window.searchArray) ||
        window.searchArray.length === 0
      ) {
        window.searchArray = getNotes();
        console.log(window.searchArray);
      }

      let results = await searchNotesParallel(
        window.searchArray,
        searchText.split(" ")
      );
      console.log("Search Results:", results);
      results.forEach((result) => {
        let noteElement = document.querySelector(
          `.note[noteid='${result.noteId}']`
        );
        if (noteElement) {
          noteElement.style.display = result.isMatch ? "inline-block" : "none";
        }
      });
      if (searchText === "") {
        window.searchArray = [];
      }
    }

    const searchInput = document.querySelector(
      ".header__searchContainer__search"
    );
    searchInput.addEventListener("input", debounce(handleSearch, 500));
  }
  handleDragStart(e) {
    this.style.opacity = "0.4";
    window.draggedElement = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", this.getAttribute("noteId"));
    window.initialOrderId = this.getAttribute("orderId");
    window.initialParentContainer = this.parentElement.className;
  }

  handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  handleDragEnter(e) {
    this.classList.add("dragover");
  }

  handleDragLeave(e) {
    this.classList.remove("dragover");
  }

  async handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    let noteId = e.dataTransfer.getData("text/plain");
    let droppedNote = document.querySelector(`.note[noteId="${noteId}"]`);
    if (window.draggedElement !== this) {
      let sourceContainer = window.draggedElement.parentElement;
      let targetContainer = this.parentElement;
      if (sourceContainer !== targetContainer) {
        return false;
      }
      if (targetContainer && window.draggedElement) {
        let finalOrderId = this.getAttribute("orderId");
        let finalParentContainer = this.parentElement.className;
        let result;
        if (window.initialParentContainer === "notes__pin__noteCon") {
            result=await model.reorder(window.initialOrderId,finalOrderId,true)
        } else {
            console.log("check check")
            result=await model.reorder(window.initialOrderId,finalOrderId,false)
        }
        if(result.success){
            console.log("reorder result",result);
            document.querySelector('.'+finalParentContainer).innerHTML="";
            window.pinnedCount=0;
            noteView.viewNote(result);
        }
      }
    }
    return false;
  }

  handleDragEnd(e) {
    this.style.opacity = "1";
    document.querySelectorAll(".note").forEach((note) => {
      note.classList.remove("dragover");
    });
    delete window.draggedElement;
    delete window.initialOrderId;
    delete window.initialParentContainer;
  }
}
