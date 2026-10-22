
const gateSelect = document.getElementById("gateSelect");
const inputA = document.getElementById("inputA");
const inputB = document.getElementById("inputB");
const inputBRow = document.getElementById("inputBRow");

const outputLed = document.getElementById("outputLed");
const outputMessage = document.getElementById("outputMessage");
const expression = document.getElementById("expression");
const gateSymbol = document.getElementById("gateSymbol");
const signalA = document.getElementById("signalA");
const signalY = document.getElementById("signalY");
const resetButton = document.getElementById("resetButton");

const truthTableBody = document.getElementById("truthTableBody");
const columnB = document.getElementById("columnB");
const exportButton = document.getElementById("exportButton");
const outputHeader = document.getElementById("outputHeader");

// Boolean expressions for each gate
const expressions = {
  AND: "Y = A · B",
  OR: "Y = A + B",
  NOT: "Y = A̅",
  NAND: "Y = (A · B)",
  NOR: "Y = (A + B)",
  XOR: "Y = A ⊕ B",
  XNOR: "Y = (A ⊕ B)"
};

// Gate calculations
function calculateOutput(gate, a, b) {
  switch (gate) {
    case "AND":
      return a & b;

    case "OR":
      return a | b;

    case "NOT":
      return 1 - a;

    case "NAND":
      return 1 - (a & b);

    case "NOR":
      return 1 - (a | b);

    case "XOR":
      return a ^ b;

    case "XNOR":
      return 1 - (a ^ b);

    default:
      return 0;
  }
}


function generateTruthTable() {
  const gate = gateSelect.value;
  const isNotGate = gate === "NOT";

  const currentA = Number(inputA.textContent);
  const currentB = Number(inputB.textContent);

  // Update table headers
  columnB.hidden = isNotGate;
  outputHeader.hidden = false;

  truthTableBody.innerHTML = "";

  // NOT has two input combinations; other gates have four.
  const combinations = isNotGate
    ? [[0], [1]]
    : [[0, 0], [0, 1], [1, 0], [1, 1]];

  combinations.forEach(inputs => {
    const a = inputs[0];
    const b = isNotGate ? 0 : inputs[1];

    const output = calculateOutput(gate, a, b);
    const row = document.createElement("tr");

    // Highlight the currently selected inputs
    if (a === currentA && (isNotGate || b === currentB)) {
      row.classList.add("active-row");
    }

    // Create cells dynamically
    const values = isNotGate
      ? [a, output]
      : [a, b, output];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    truthTableBody.appendChild(row);
  });
}


// Toggle an input between 0 and 1
function toggleInput(button) {
  const currentValue = Number(button.textContent);
  const newValue = 1 - currentValue;

  button.textContent = newValue;
  button.classList.toggle("active", newValue === 1);
  button.setAttribute("aria-pressed", String(newValue === 1));

  updateSimulator();
}

// Update all displayed values
function updateSimulator() {
  const gate = gateSelect.value;
  const a = Number(inputA.textContent);
  const b = Number(inputB.textContent);

  // NOT gate requires only one input
  const isNotGate = gate === "NOT";

  inputBRow.hidden = isNotGate;
  inputB.disabled = isNotGate;

  const output = calculateOutput(gate, a, b);

  gateSymbol.textContent = gate;
  signalA.textContent = a;
  signalY.textContent = output;

  if (gate === "NAND") {
  expression.innerHTML = 'Y = <span class="overbar">(A · B)</span>';
} else if (gate === "NOR") {
  expression.innerHTML = 'Y = <span class="overbar">(A + B)</span>';
} else {
  expression.textContent = expressions[gate];
}

  outputLed.textContent = output;
  outputLed.classList.toggle("on", output === 1);

  outputMessage.textContent =
    output === 1 ? "Output is HIGH" : "Output is LOW";

    generateTruthTable();
}

// Reset both inputs to zero
function resetInputs() {
  [inputA, inputB].forEach(button => {
    button.textContent = "0";
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });

  updateSimulator();
}

// Event listeners
inputA.addEventListener("click", () => toggleInput(inputA));
inputB.addEventListener("click", () => toggleInput(inputB));

gateSelect.addEventListener("change", updateSimulator);
resetButton.addEventListener("click", resetInputs);

// Initial state
updateSimulator();


exportButton.addEventListener("click", () => {
  const gate = gateSelect.value;
  const isNotGate = gate === "NOT";

  const headers = isNotGate
    ? ["A", "Output (Y)"]
    : ["A", "B", "Output (Y)"];

  const rows = [headers];

  const combinations = isNotGate
    ? [[0]]
    : [[0, 0], [0, 1], [1, 0], [1, 1]];

  combinations.forEach(inputs => {
    const a = inputs[0];
    const b = isNotGate ? 0 : inputs[1];
    const output = calculateOutput(gate, a, b);

    rows.push(isNotGate ? [a, output] : [a, b, output]);
  });

  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${gate.toLowerCase()}-truth-table.csv`;
  link.click();

  URL.revokeObjectURL(url);
});
