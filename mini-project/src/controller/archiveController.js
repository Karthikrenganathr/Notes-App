import * as model from '../model/model.js'
import ArchiveView from '../views/archiveView.js'
const archiveView=new ArchiveView();
export default class archiveController{
    archiveSection(){
        console.log("HI")
        const archiveClick = document.querySelector(".sidesection__container:nth-child(2)"); 
        archiveClick.addEventListener("click", async function () {
            if(window.currentPage!=="trash")
            {
                if(!navigator.onLine)
                {
                    alert("You are offline cannt switch page");
                    return;
                }
                archiveClick.style.backgroundColor = "rgba(255, 235, 59, 0.4)";
                archiveClick.addEventListener("mouseover", () => {
                    archiveClick.style.backgroundColor = "lightgray"; 
                });
                
                archiveClick.addEventListener("mouseout", () => {
                    archiveClick.style.backgroundColor = "rgba(255, 235, 59, 0.4)";
                });
                const mainSection=document.querySelector(".sidesection__container:nth-child(1)")
                mainSection.style.backgroundColor = "transparent"
                mainSection.addEventListener("mouseover", () => {
                    mainSection.style.backgroundColor = "lightgray"; 
                });
                mainSection.addEventListener("mouseout", () => {
                    mainSection.style.backgroundColor = "white";
                });
                const notesDiv = document.querySelector(".notes");
                let response = await fetch('../../src/pages/archive/archive.html');
                let content = await response.text(); 
                notesDiv.innerHTML = content;
                let deleteNote=await model.trashNotes();
                console.log("delete",deleteNote)
                archiveView.viewArchive(deleteNote);
                window.currentPage="trash"
            }
        });
    }
    async  permanentDelte(id){
        let noteElement = document.querySelector(`[noteId='${id}']`);
        if (noteElement) {
            let result=await model.permDelete(id);
            noteElement.remove(); 
        }
    }
    async  restore(id) {
        let noteElement = document.querySelector(`[noteId='${id}']`);
        if (noteElement) {
            let result = await model.restoreNote(id);
            noteElement.remove();
        }
    }
}
