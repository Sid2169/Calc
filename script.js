import { conversionTable } from "./conversionTable.js";

console.log("🚀 Its Working ~ conversionTable:", conversionTable);

/* --------------------- GLOBAL STRINGS --------------------- */
// displayStr: what the user sees in the input field
// update displayStr every time input field value is updated

let displayStr = "";
const displayText = document.getElementById("displayText");

displayText.addEventListener("input", () => {
  displayStr = displayText.value;
});

// convert function
async function convert(quantityType, baseUnit, targetUnit, value) {
  value = Number(value);
  if (isNaN(value)) return;
  let conversionResult = 0;

  // Handle currency conversion
  if (quantityType === "currency") {
    const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseUnit}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data?.rates?.[targetUnit]) {
        conversionResult = value * data.rates[targetUnit];
      } else {
        throw new Error(
          `Conversion rate not available for ${baseUnit} to ${targetUnit}.`
        );
      }
    } catch (error) {
      console.error("Error fetching currency conversion:", error);
      return;
    }
  }

  // Handle temperature conversion
  else if (quantityType === "temperature") {
    if (baseUnit === "celsius") {
      conversionResult =
        targetUnit === "fahrenheit"
          ? conversionTable.temperature.celsiusToFahrenheit(value)
          : targetUnit === "kelvin"
          ? conversionTable.temperature.celsiusToKelvin(value)
          : targetUnit === "rankine"
          ? conversionTable.temperature.celsiusToRankine(value)
          : value;
    } else if (baseUnit === "fahrenheit") {
      conversionResult =
        targetUnit === "celsius"
          ? conversionTable.temperature.fahrenheitToCelsius(value)
          : targetUnit === "kelvin"
          ? conversionTable.temperature.fahrenheitToKelvin(value)
          : targetUnit === "rankine"
          ? conversionTable.temperature.fahrenheitToRankine(value)
          : value;
    }
  }

  // Handle other unit conversions
  else if (conversionTable[quantityType]?.[baseUnit]?.[targetUnit]) {
    conversionResult =
      value * conversionTable[quantityType][baseUnit][targetUnit];
  } else {
    console.error(
      `Conversion from ${baseUnit} to ${targetUnit} not available in ${quantityType}.`
    );
    return;
  }

  // Show updated result on screen
  document.querySelector(
    `.${quantityType} .result`
  ).textContent = `${value} ${baseUnit} = ${conversionResult} ${targetUnit}`;
}

/* 
  -- UNDO BUTTON --
*/
document.getElementById("undo").addEventListener("click", () => {
  displayStr = displayStr.slice(0, -1);
  displayText.value = displayStr || "0";
});

/* 
  -- MODE SWITCHING --
*/
const modeSelector = document.getElementById("modeSelector");
const advancedButtons = document.querySelector(".advanced-buttons");
const basicButtons = document.querySelector(".basic-buttons");

modeSelector.addEventListener("change", () => {
  switch (modeSelector.value) {
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
let selectedConverter = document.querySelector(".angle");
const conversionSelector = document.getElementById("quantitySelector");
const quantityConverterSet = document.querySelectorAll(".converter-container");

conversionSelector.addEventListener("change", () => {
  selectedConverter.classList.add("converter-hidden");
  selectedConverter.classList.remove("converter-active");

  selectedConverter = [...quantityConverterSet].find((element) =>
    element.classList.contains(conversionSelector.value)
  );

  selectedConverter.classList.remove("converter-hidden");
  selectedConverter.classList.add("converter-active");

  convert(
    conversionSelector.value,
    selectedConverter.querySelector(".from-unit").value,
    selectedConverter.querySelector(".to-unit").value,
    displayStr
  );
});

// Unit changing
document.querySelectorAll(".from-unit, .to-unit").forEach((element) => {
  element.addEventListener("change", () => {
    convert(
      conversionSelector.value,
      document.querySelector(".converter-active .from-unit").value,
      document.querySelector(".converter-active .to-unit").value,
      displayStr
    );
  });
});

// Switch units button
document.querySelectorAll(".switch-btn").forEach((switchBtn) => {
  switchBtn.addEventListener("click", () => {
    const fromUnitElement = document.querySelector(
      ".converter-active .from-unit"
    );
    const toUnitElement = document.querySelector(".converter-active .to-unit");

    [fromUnitElement.value, toUnitElement.value] = [
      toUnitElement.value,
      fromUnitElement.value,
    ];

    convert(
      conversionSelector.value,
      fromUnitElement.value,
      toUnitElement.value,
      displayStr
    );
  });
});

// Clear button
document.getElementById("clear-btn").addEventListener("click", () => {
  displayText.value = "0";
  displayText.dispatchEvent(
    new Event("input", { bubbles: true, cancelable: true })
  );
});
