/* --------------------- GLOBAL STRINGS --------------------- */
// displayStr: what the user sees in the input field
// update displayStr every time input field value is updated

let displayStr = "";
document.getElementById("displayText").addEventListener('input', () => {
    displayStr = document.getElementById("displayText").value;
})
 
/* 
  -- UNDO BUTTON --
  Removes the last character from the displayed expression.
*/
document.getElementById("undo").addEventListener("click", () => {
    displayStr = displayStr.slice(0, -1);
    displayText.value = displayStr || "0";
  });
