import { http, HttpResponse } from "msw";
import { updateNotes } from "../src/model/model";

export const SERVER_URL = "http://localhost:5070";

let notesId = 1;
let notes = [];
export const handlers = [
  http.get(`${SERVER_URL}/notes`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    let filteredNotes = notes;
    if (category) {
      filteredNotes = notes.filter((note) => note.category === category);
    }
    console.log(notes);
    return HttpResponse.json({ notes: filteredNotes });
  }),
  http.post(`${SERVER_URL}/notes`, async ({ request, params, cookies }) => {
    const requestBody = await request.json();
    if (!requestBody.title && !requestBody.text) {
      return HttpResponse(null, { status: 400 });
    }
    notes.push({
      id: notesId++,
      title: requestBody.title,
      text: requestBody.text,
      category: "mainNote",
      isPinned: requestBody.isPinned,
    });
    console.log("post", notes);
    return HttpResponse.json({ success: true, id: notesId - 1 });
  }),
  http.patch(
    `${SERVER_URL}/notes/:id`,
    async ({ request, params, cookies }) => {
      const note = notes.find((n) => n.id === Number(params.id));
      if (!note) {
        return HttpResponse(null, { status: 400 });
      }
      const requestBody = await request.json();
      if (requestBody.title) {
        note.title = requestBody.title;
      }

      if (requestBody.text) {
        note.text = requestBody.text;
      }
      if (requestBody.category) {
        note.category = requestBody.category;
      }
      if ("isPinned" in requestBody) {
        note.isPinned = requestBody.isPinned;
      }
      console.log("patch", notes);
      return HttpResponse.json({ success: true });
    }
  ),
  http.delete(
    `${SERVER_URL}/notes/:id`,
    async ({ request, params, cookies }) => {
      const noteIndex = notes.findIndex((n) => n.id === Number(params.id));
      if (noteIndex === -1) {
        return new HttpResponse(null, { status: 400 });
      }

      notes.splice(noteIndex, 1);
      console.log(notes);

      return new HttpResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  ),
  http.post(
    `${SERVER_URL}/notes/sync`,
    async ({ request, params, cookies }) => {
      const responseBody = await request.json();
      if (!responseBody.notes || !responseBody.notes.length) {
        return HttpResponse(null, { status: 400 });
      }
      let updateNotes = responseBody.notes;
      console.log(updateNotes);
      //return HttpResponse.json({ success: true ,updateId:returnArr})
      console.log(updateNotes);
      let returnArr = [];
      updateNotes.forEach((noteObj) => {
        let id = parseInt(Object.keys(noteObj)[0], 10);
        let value = noteObj[id];
        if (id < 0) {
          notes.push({
            id: notesId++,
            title: value.title,
            text: value.text,
            category: value.category ? value.category : "mainNote",
            isPinned: value.isPinned,
          });
          returnArr.push({ [id]: notesId - 1 });
        } else if (Object.keys(value).length === 0) {
          const noteIndex = notes.findIndex((n) => n.id === id);
          notes.splice(noteIndex, 1);
        } else {
          const note = notes.find((n) => n.id === id);
          if (value.title) {
            note.title = value.title;
          }

          if (value.text) {
            note.text = value.text;
          }
          if (value.category) {
            note.category = value.category;
          }
          if ("isPinned" in value) {
            note.isPinned = value.isPinned;
          }
        }
      });
      console.log("updated notess",notes);
      console.log("returnArr",returnArr)
      return HttpResponse.json({ success: true ,updateId:returnArr});
    }
  ),
];
