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

/* 
  -- MODE SWITCHING --
  "advanced": show the advanced keypad, including advanced buttons
  "basic": show the keypad but hide advanced buttons
  "keyboard": hide the entire panel (user can type into the display manually)
*/
// Get the select element and the result display element
const modeSelector = document.getElementById("modeSelector");
const advancedButtons = document.querySelector(".advanced-buttons");
const basicButtons = document.querySelector(".basic-buttons")
// Add an event listener for the change event
modeSelector.addEventListener('change', () => {
    // Get the selected value
    const selectedValue = modeSelector.value;
    switch (selectedValue) {
        case 'advanced':
            advancedButtons.classList.remove("panel-hidden");
            basicButtons.classList.remove("panel-hidden")
            break;
        case 'basic':
            advancedButtons.classList.add("panel-hidden");
            basicButtons.classList.remove("panel-hidden")
            break;
        case 'keyboard':
            basicButtons.classList.add("panel-hidden");
            advancedButtons.classList.add("panel-hidden")
            break;
    }
});

/** ----- CONVERSTION MODE SELECTOR ------ */
let currentQuantity = document.querySelector(".angle");
const conversionSelector = document.querySelector("#quantitySelector");
const quantitySet = document.querySelectorAll(".converter-container")
conversionSelector.addEventListener('change', () => {
    
    currentQuantity.classList.add("converter-hidden");
    const quantity = conversionSelector.value;
    quantitySet.forEach(element => {
        if (element.classList.contains(quantity)) currentQuantity = element;
    })
    currentQuantity.classList.remove("converter-hidden")

})
