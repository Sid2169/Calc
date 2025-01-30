/* --------------------- GLOBAL STRINGS --------------------- */
// displayStr: what the user sees in the input field
let displayStr = "";  
/* 
  -- UNDO BUTTON --
  Removes the last character from the displayed expression.
*/
document.getElementById("undo").addEventListener("click", () => {
    displayStr = displayStr.slice(0, -1);
    displayText.value = displayStr || "0";
  });
  