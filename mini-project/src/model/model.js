import { SERVER_URL } from "../../mocks/handlers";

export async function storeNotes(title, description, isPinned) {
  if (!navigator.onLine) {
    let note = { title: title, text: description, isPinned: isPinned };
    localStorage.setItem(window.defaultCreateIndex, JSON.stringify(note));
    window.defaultCreateIndex--;
    return { success: true, id: window.defaultCreateIndex + 1 };
  } else {
    let response = await fetch(`${SERVER_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        title: title,
        text: description,
        isPinned: isPinned,
      }),
    });
    let result = await response.json();
    return result;
  }
}

export async function getNotes() {
  let response = await fetch(`${SERVER_URL}/notes?category=mainNote`);
  let result = await response.json();
  return result;
}

function updateLocalStorage(existingNote, newNode) {
  let note = JSON.parse(existingNote);
  for (let key of Object.keys(newNode)) {
    note[key] = newNode[key];
  }
  return note;
}

export async function updateNotes(title, text, id) {
  console.log(id);
  if (!navigator.onLine) {
    let existingNote = localStorage.getItem(id);
    let newnode = { title: title, text: text };
    if (existingNote) {
      localStorage.setItem(
        id,
        JSON.stringify(updateLocalStorage(existingNote, newnode))
      );
    } else {
      localStorage.setItem(id, JSON.stringify(newnode));
    }
    return { success: true };
  } else {
    const response = await fetch(`${SERVER_URL}/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        text: text,
      }),
    });
    const result = await response.json();
    return result;
  }
}

export async function archiveNote(id) {
  console.log(id);
  if (!navigator.onLine) {
    let existingNote = localStorage.getItem(id);
    let newnode = { category: "trash", isPinned: false };
    if (existingNote) {
      localStorage.setItem(
        id,
        JSON.stringify(updateLocalStorage(existingNote, newnode))
      );
    } else {
      localStorage.setItem(id, JSON.stringify(newnode));
    }
    return { success: true };
  } else {
    const response = await fetch(`${SERVER_URL}/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: "trash",
        isPinned: false,
      }),
    });
    const result = await response.json();
    return result;
  }
}

export async function pinUnpinNode(id, status) {
  console.log(id, status);
  if (!navigator.onLine) {
    let existingNote = localStorage.getItem(id);
    let newnode = { isPinned: status };
    if (existingNote) {
      localStorage.setItem(
        id,
        JSON.stringify(updateLocalStorage(existingNote, newnode))
      );
    } else {
      localStorage.setItem(id, JSON.stringify(newnode));
    }
    return { success: true };
  } else {
    const response = await fetch(`${SERVER_URL}/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPinned: status,
      }),
    });
    const result = await response.json();
    return result;
  }
}

export async function trashNotes() {
  let response = await fetch(`${SERVER_URL}/notes?category=trash`);
  let result = await response.json();
  return result;
}

export async function permDelete(id) {
  if (!navigator.onLine) {
    localStorage.setItem(id, JSON.stringify({}));
  } else {
    let response = await fetch(`${SERVER_URL}/notes/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    return result;
  }
}

export async function restoreNote(id) {
  if (!navigator.onLine) {
    let existingNote = localStorage.getItem(id);
    let newnode = { category: "mainNote" };
    if (existingNote) {
      localStorage.setItem(
        id,
        JSON.stringify(updateLocalStorage(existingNote, newnode))
      );
    } else {
      localStorage.setItem(id, JSON.stringify(newnode));
    }
    return { success: true };
  }
  const response = await fetch(`${SERVER_URL}/notes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: "mainNote",
    }),
  });
  const result = await response.json();
  return result;
}

export async function syncOfflineNotes() {
  console.log("online");
  if (!navigator.onLine) return;
  let notesArray = [];
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let storedData = localStorage.getItem(key);
    let parsedData = JSON.parse(storedData);
    notesArray.push({ [key]: parsedData });
  }
  if (notesArray.length > 0) {
    try {
      let response = await fetch(`${SERVER_URL}/notes/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: notesArray }),
      });

      let result = await response.json();
      if (result.success) {
        localStorage.clear();
        let updateValue = result.updateId;
        updateValue.forEach((noteObj) => {
          let id = parseInt(Object.keys(noteObj)[0], 10);
          let orginalId = noteObj[id];
          console.log(id, orginalId);
          let noteElement = document.querySelector(`[noteId="${id}"]`);
          console.log(noteElement);
          if (noteElement) {
            noteElement.setAttribute("noteId", orginalId);
          }
        });
      }
    } catch (error) {
      console.error("Error syncing notes:", error);
    }
  }
}
export async function reorder(intial,final,isPin) {
  console.log(intial,final,isPin)
  const url = `${SERVER_URL}/notes/reorder?initial=${intial}&final=${final}&ispin=${isPin}`;
  const response = await fetch(url, {
  method: "GET",
  headers: {
        "Content-Type": "application/json"
    }
  });
  return await response.json();
}
