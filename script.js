import { conversionTable } from "./conversionTable.js";

console.log("🚀Its Working ~ conversionTable:", conversionTable);
/* --------------------- GLOBAL STRINGS --------------------- */
// displayStr: what the user sees in the input field
// update displayStr every time input field value is updated

let displayStr = "";
document.getElementById("displayText").addEventListener("input", () => {
  displayStr = document.getElementById("displayText").value;
});

// convert function
function convert(quantityType, baseUnit, targetUnit, value) {
  //Verify if the value is a number or not
  value = Number(value);
  if (isNaN(value)) return;
  let conversionResult = 0;

  // Handle currency conversion
  if (quantityType === "currency") {
    const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseUnit}`; // Example API endpoint

    try {
      let data;
      const response = fetch(apiUrl)
        .then((r) => r.json())
        .then((d) => {
          data = d;
        });
      if (data && data.rates && data.rates[targetUnit]) {
        const conversionRate = data.rates[targetUnit];
        conversionResult = value * conversionRate;
      } else {
        throw new Error(
          `Conversion rate not available for ${baseUnit} to ${targetUnit}.`
        );
      }
    } catch (error) {
      console.error("Error fetching currency conversion:", error);
      return; // Exit the function if there's an error
    }
  }

  // Handle temperature conversion
  else if (quantityType === "temperature") {
    if (baseUnit === "celsius") {
      if (targetUnit === "fahrenheit") {
        conversionResult =
          conversionTable.temperature.celsiusToFahrenheit(value);
      } else if (targetUnit === "kelvin") {
        conversionResult = conversionTable.temperature.celsiusToKelvin(value);
      } else if (targetUnit === "rankine") {
        conversionResult = conversionTable.temperature.celsiusToRankine(value);
      } else conversionResult = value;
    }

    if (baseUnit === "fahrenheit") {
      if (targetUnit === "celsius") {
        conversionResult =
          conversionTable.temperature.fahrenheitToCelsius(value);
      } else if (targetUnit === "kelvin") {
        conversionResult =
          conversionTable.temperature.fahrenheitToKelvin(value);
      } else if (targetUnit === "rankine") {
        conversionResult =
          conversionTable.temperature.fahrenheitToRankine(value);
      } else conversionResult = value;
    }

    else {
        // Handle other unit conversions
        if (conversionTable[quantityType] && conversionTable[quantityType][baseUnit] && conversionTable[quantityType][baseUnit][targetUnit]) {
            const conversionFactor = conversionTable[quantityType][baseUnit][targetUnit];
            conversionResult = value * conversionFactor;
        } else {
            throw new Error(`Conversion from ${baseUnit} to ${targetUnit} not available in ${quantityType}.`);
        }
    }

  //Show updated result on screen
  document.querySelector(
    `.${quantityType} .result`
  ).textContent = `${value} ${baseUnit} = ${conversionResult} ${targetUnit}`;
}

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
const basicButtons = document.querySelector(".basic-buttons");
// Add an event listener for the change event
modeSelector.addEventListener("change", () => {
  // Get the selected value
  const selectedValue = modeSelector.value;
  switch (selectedValue) {
    case "advanced":
      advancedButtons.classList.remove("panel-hidden");
      basicButtons.classList.remove("panel-hidden");
      break;
    case "basic":
      advancedButtons.classList.add("panel-hidden");
      basicButtons.classList.remove("panel-hidden");
      break;
    case "keyboard":
      basicButtons.classList.add("panel-hidden");
      advancedButtons.classList.add("panel-hidden");
      break;
  }
});

/** ----- CONVERSION MODE SELECTOR ------ */

//Quantity changing
let selectedConverter = document.querySelector(".angle");
let selectedFromUnit = document.querySelector(
  ".converter-active .from-unit"
).value;
let selectedToUnit = document.querySelector(".converter-active .to-unit").value;
const conversionSelector = document.querySelector("#quantitySelector");
let selectedQuantity = conversionSelector.value;
const quantityConverterSet = document.querySelectorAll(".converter-container");
conversionSelector.addEventListener("change", () => {
  selectedConverter.classList.add("converter-hidden");
  selectedConverter.classList.remove("converter-active");
  selectedQuantity = conversionSelector.value;
  quantityConverterSet.forEach((element) => {
    if (element.classList.contains(selectedQuantity))
      selectedConverter = element;
  });
  selectedConverter.classList.remove("converter-hidden");
  selectedConverter.classList.add("converter-active");
  selectedFromUnit = document.querySelector(
    ".converter-active .from-unit"
  ).value;
  selectedToUnit = document.querySelector(".converter-active .to-unit").value;

  convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
});

//Unit Changing
const setOfFromUnitSelectors = document.querySelectorAll(".from-unit");
setOfFromUnitSelectors.forEach((element) => {
  element.addEventListener("change", () => {
    selectedFromUnit = document.querySelector(
      ".converter-active .from-unit"
    ).value;
    convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
  });
});
const setOfToUnitSelectors = document.querySelectorAll(".to-unit");
setOfToUnitSelectors.forEach((element) => {
  element.addEventListener("change", () => {
    selectedToUnit = document.querySelector(".converter-active .to-unit").value;
    convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
  });
});

const unitSwitchBtns = document.querySelectorAll('.switch-btn');
unitSwitchBtns.forEach(switchBtn => {
    switchBtn.addEventListener('click', () => {
        let temp = selectedFromUnit;
        document.querySelector(".converter-active .from-unit").value = selectedToUnit;
        selectedFromUnit = selectedToUnit;

        document.querySelector(".converter-active .to-unit").value = temp;
        selectedToUnit = temp;

        convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
    })
})

document.getElementById('clear-btn').addEventListener('click', () => {
    inputText.value = "0";
    // Create and dispatch the input event
    const event = new Event('input', {
        bubbles: true,
        cancelable: true
    });
    inputText.dispatchEvent(event);
});
