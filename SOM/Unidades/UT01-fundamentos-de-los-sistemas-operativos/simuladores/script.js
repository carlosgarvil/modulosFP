const BYTE_SIZE = 256;
const RUN_DELAY = 450;
const BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

const memory = new Uint8Array(BYTE_SIZE);
let addressBits = Array(8).fill(0);
let dataBits = Array(8).fill(0);
let pc = 0;
let ir = 0;
let ac = 0;
let state = "detenido";
let lastModified = null;
let runTimer = null;

const els = {
  addressSwitches: document.getElementById("addressSwitches"),
  dataSwitches: document.getElementById("dataSwitches"),
  addressHex: document.getElementById("addressHex"),
  addressDecimal: document.getElementById("addressDecimal"),
  addressBinary: document.getElementById("addressBinary"),
  dataHex: document.getElementById("dataHex"),
  dataDecimal: document.getElementById("dataDecimal"),
  dataBinary: document.getElementById("dataBinary"),
  dataAscii: document.getElementById("dataAscii"),
  memoryBody: document.getElementById("memoryBody"),
  consoleOutput: document.getElementById("consoleOutput"),
  pcValue: document.getElementById("pcValue"),
  irValue: document.getElementById("irValue"),
  acValue: document.getElementById("acValue"),
  stateValue: document.getElementById("stateValue"),
  loadButton: document.getElementById("loadButton"),
  stepButton: document.getElementById("stepButton"),
  runButton: document.getElementById("runButton"),
  stopButton: document.getElementById("stopButton"),
  resetButton: document.getElementById("resetButton"),
  clearButton: document.getElementById("clearButton"),
  demoButton: document.getElementById("demoButton"),
  instructionModal: document.getElementById("instructionModal"),
  modalCloseButton: document.getElementById("modalCloseButton"),
  modalCode: document.getElementById("modalCode"),
  modalTitle: document.getElementById("modalTitle"),
  modalSummary: document.getElementById("modalSummary"),
  modalFormat: document.getElementById("modalFormat"),
  modalOperand: document.getElementById("modalOperand"),
  modalEffect: document.getElementById("modalEffect"),
  modalExample: document.getElementById("modalExample")
};

const instructionNames = {
  0x00: "HALT",
  0x01: "LOAD",
  0x02: "STORE",
  0x03: "ADD",
  0x04: "SUB",
  0x05: "JMP",
  0x06: "JZ",
  0x07: "JNZ",
  0x08: "OUT",
  0x09: "OUTN"
};

const instructionHelp = {
  "00": {
    title: "HALT",
    summary: "Detiene la ejecución del programa. Sirve para indicar a la CPU que ya no debe seguir leyendo más instrucciones.",
    format: "00 00",
    operand: "No necesita dirección. En este simulador se puede dejar un segundo byte, pero la CPU lo ignora.",
    effect: "El estado pasa a detenido. PC e IR muestran la última instrucción ejecutada.",
    example: "08: 00 00  ; detener el programa"
  },
  "01": {
    title: "LOAD addr",
    summary: "Carga en el acumulador el byte guardado en una dirección de memoria.",
    format: "01 addr",
    operand: "El segundo byte es una dirección de memoria. Por ejemplo, 20 significa leer memoria[20].",
    effect: "AC recibe el contenido de memoria[addr]. Después, PC avanza 2 posiciones.",
    example: "00: 01 20  ; AC = memoria[20]"
  },
  "02": {
    title: "STORE addr",
    summary: "Guarda el valor actual del acumulador en una posición de memoria.",
    format: "02 addr",
    operand: "El segundo byte indica la dirección donde se escribirá el contenido de AC.",
    effect: "memoria[addr] recibe AC. Después, PC avanza 2 posiciones.",
    example: "04: 02 22  ; memoria[22] = AC"
  },
  "03": {
    title: "ADD addr",
    summary: "Suma al acumulador el byte guardado en una dirección de memoria.",
    format: "03 addr",
    operand: "El segundo byte es la dirección del dato que se va a sumar.",
    effect: "AC = AC + memoria[addr]. Si el resultado supera 255, se conserva solo el resultado módulo 256.",
    example: "02: 03 21  ; AC = AC + memoria[21]"
  },
  "04": {
    title: "SUB addr",
    summary: "Resta al acumulador el byte guardado en una dirección de memoria.",
    format: "04 addr",
    operand: "El segundo byte es la dirección del dato que se va a restar.",
    effect: "AC = AC - memoria[addr]. El resultado se mantiene dentro de 8 bits.",
    example: "02: 04 21  ; AC = AC - memoria[21]"
  },
  "05": {
    title: "JMP addr",
    summary: "Cambia el flujo del programa saltando directamente a otra dirección.",
    format: "05 addr",
    operand: "El segundo byte es la nueva dirección que recibirá el PC.",
    effect: "PC pasa a valer addr. No avanza automáticamente 2 posiciones.",
    example: "10: 05 00  ; volver a la dirección 00"
  },
  "06": {
    title: "JZ addr",
    summary: "Salta a otra dirección solo si el acumulador vale cero.",
    format: "06 addr",
    operand: "El segundo byte es la dirección de destino si AC es 0.",
    effect: "Si AC es 0, PC = addr. Si AC no es 0, PC avanza 2 posiciones.",
    example: "10: 06 18  ; saltar a 18 si AC es cero"
  },
  "07": {
    title: "JNZ addr",
    summary: "Salta a otra dirección solo si el acumulador no vale cero.",
    format: "07 addr",
    operand: "El segundo byte es la dirección de destino si AC no es 0.",
    effect: "Si AC no es 0, PC = addr. Si AC es 0, PC avanza 2 posiciones.",
    example: "10: 07 04  ; saltar a 04 si AC no es cero"
  },
  "08": {
    title: "OUT addr",
    summary: "Escribe en la consola el carácter ASCII almacenado en una posición de memoria.",
    format: "08 addr",
    operand: "El segundo byte es la dirección del dato que se interpretará como carácter ASCII.",
    effect: "La consola muestra el carácter de memoria[addr]. Después, PC avanza 2 posiciones.",
    example: "06: 08 30  ; mostrar el carácter guardado en 30"
  },
  "09": {
    title: "OUTN addr",
    summary: "Escribe en la consola el valor numérico almacenado en una posición de memoria.",
    format: "09 addr",
    operand: "El segundo byte es la dirección del dato que se mostrará como número decimal.",
    effect: "La consola muestra memoria[addr] como número. Después, PC avanza 2 posiciones.",
    example: "06: 09 22  ; mostrar el número guardado en 22"
  }
};

function toHex(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function toBinary(value) {
  return value.toString(2).padStart(8, "0");
}

function bitsToValue(bits) {
  return bits.reduce((sum, bit, index) => sum + bit * BIT_WEIGHTS[index], 0);
}

function printableAscii(value) {
  return value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";
}

function selectedAddress() {
  return bitsToValue(addressBits);
}

function selectedData() {
  return bitsToValue(dataBits);
}

function logLine(text = "") {
  els.consoleOutput.textContent += `${text}\n`;
  els.consoleOutput.scrollTop = els.consoleOutput.scrollHeight;
}

function openInstructionModal(code) {
  const help = instructionHelp[code];
  if (!help) {
    return;
  }

  els.modalCode.textContent = code;
  els.modalTitle.textContent = help.title;
  els.modalSummary.textContent = help.summary;
  els.modalFormat.textContent = help.format;
  els.modalOperand.textContent = help.operand;
  els.modalEffect.textContent = help.effect;
  els.modalExample.textContent = help.example;
  els.instructionModal.hidden = false;
  els.modalCloseButton.focus();
}

function closeInstructionModal() {
  els.instructionModal.hidden = true;
}

function setState(nextState) {
  state = nextState;
  els.stateValue.textContent = nextState;
  els.stateValue.className = "";
  els.stateValue.classList.add(`state-${nextState}`);
}

function createSwitches(container, bits, type) {
  container.innerHTML = "";
  BIT_WEIGHTS.forEach((weight, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bit-control";

    const label = document.createElement("div");
    label.className = "bit-weight";
    label.textContent = weight;

    const button = document.createElement("button");
    button.className = `toggle ${type}-toggle`;
    button.type = "button";
    const switchGroup = type === "address" ? "dirección" : "datos";
    button.setAttribute("aria-label", `Interruptor de ${switchGroup}, peso ${weight}`);
    button.addEventListener("click", () => {
      bits[index] = bits[index] ? 0 : 1;
      updateInterface();
    });

    const value = document.createElement("div");
    value.className = "bit-value";
    value.textContent = "0";

    wrapper.append(label, button, value);
    container.appendChild(wrapper);
  });
}

function createMemoryTable() {
  els.memoryBody.innerHTML = "";
  for (let address = 0; address < BYTE_SIZE; address += 1) {
    const row = document.createElement("tr");
    row.dataset.address = String(address);
    row.addEventListener("click", () => {
      addressBits = toBinary(address).split("").map(Number);
      updateInterface();
    });

    row.innerHTML = `
      <td>${toHex(address)}</td>
      <td data-cell="binary"></td>
      <td data-cell="hex"></td>
      <td data-cell="meaning"></td>
    `;
    els.memoryBody.appendChild(row);
  }
}

function interpretation(address) {
  const value = memory[address];
  const next = memory[(address + 1) % BYTE_SIZE];
  if (instructionNames[value]) {
    const opcode = value === 0 ? "HALT" : `${instructionNames[value]} ${toHex(next)}`;
    return `${opcode} / dato ${value}`;
  }
  if (value === 0) {
    return "HALT / dato 0";
  }
  return `dato ${value} / '${printableAscii(value)}'`;
}

function updateSwitchVisuals(container, bits) {
  [...container.children].forEach((wrapper, index) => {
    const isOn = bits[index] === 1;
    wrapper.querySelector(".toggle").classList.toggle("on", isOn);
    wrapper.querySelector(".bit-value").textContent = isOn ? "1" : "0";
  });
}

function updateMemoryRows() {
  const selected = selectedAddress();
  for (const row of els.memoryBody.rows) {
    const address = Number(row.dataset.address);
    row.classList.toggle("selected", address === selected);
    row.classList.toggle("pc", address === pc);
    row.classList.toggle("modified", address === lastModified);
    row.querySelector('[data-cell="binary"]').textContent = toBinary(memory[address]);
    row.querySelector('[data-cell="hex"]').textContent = toHex(memory[address]);
    row.querySelector('[data-cell="meaning"]').textContent = interpretation(address);
  }
}

function updateInterface() {
  const address = selectedAddress();
  const data = selectedData();

  updateSwitchVisuals(els.addressSwitches, addressBits);
  updateSwitchVisuals(els.dataSwitches, dataBits);

  els.addressHex.textContent = toHex(address);
  els.addressDecimal.textContent = String(address);
  els.addressBinary.textContent = toBinary(address);

  els.dataHex.textContent = toHex(data);
  els.dataDecimal.textContent = String(data);
  els.dataBinary.textContent = toBinary(data);
  els.dataAscii.textContent = `ASCII: ${printableAscii(data)}`;

  els.pcValue.textContent = toHex(pc);
  els.irValue.textContent = toHex(ir);
  els.acValue.textContent = toBinary(ac);

  updateMemoryRows();
}

function loadSelectedByte() {
  const address = selectedAddress();
  const data = selectedData();
  memory[address] = data;
  lastModified = address;
  logLine(`> LOAD en dirección ${toHex(address)}: ${toBinary(data)} (${toHex(data)})`);
  updateInterface();
}

function stopRun() {
  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }
  if (state === "ejecutando") {
    setState("detenido");
  }
  updateInterface();
}

function executeStep() {
  if (state === "error") {
    return;
  }

  ir = memory[pc];
  const operand = memory[(pc + 1) % BYTE_SIZE];
  const oldPc = pc;

  switch (ir) {
    case 0x00:
      logLine(`PC ${toHex(oldPc)}: HALT`);
      stopRun();
      setState("detenido");
      break;
    case 0x01:
      ac = memory[operand];
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: LOAD ${toHex(operand)} -> AC=${toHex(ac)}`);
      break;
    case 0x02:
      memory[operand] = ac;
      lastModified = operand;
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: STORE ${toHex(operand)} <- ${toHex(ac)}`);
      break;
    case 0x03:
      ac = (ac + memory[operand]) % BYTE_SIZE;
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: ADD ${toHex(operand)} -> AC=${toHex(ac)}`);
      break;
    case 0x04:
      ac = (ac - memory[operand] + BYTE_SIZE) % BYTE_SIZE;
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: SUB ${toHex(operand)} -> AC=${toHex(ac)}`);
      break;
    case 0x05:
      pc = operand;
      logLine(`PC ${toHex(oldPc)}: JMP ${toHex(operand)}`);
      break;
    case 0x06:
      pc = ac === 0 ? operand : (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: JZ ${toHex(operand)} ${ac === 0 ? "salta" : "continúa"}`);
      break;
    case 0x07:
      pc = ac !== 0 ? operand : (pc + 2) % BYTE_SIZE;
      logLine(`PC ${toHex(oldPc)}: JNZ ${toHex(operand)} ${ac !== 0 ? "salta" : "continúa"}`);
      break;
    case 0x08:
      els.consoleOutput.textContent += printableAscii(memory[operand]);
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`  OUT ${toHex(operand)}`);
      break;
    case 0x09:
      els.consoleOutput.textContent += String(memory[operand]);
      pc = (pc + 2) % BYTE_SIZE;
      logLine(`  OUTN ${toHex(operand)}`);
      break;
    default:
      stopRun();
      setState("error");
      logLine(`ERROR: instrucción desconocida ${toHex(ir)} en ${toHex(oldPc)}`);
      break;
  }

  updateInterface();
}

function runProgram() {
  if (runTimer || state === "error") {
    return;
  }
  setState("ejecutando");
  logLine("> RUN");
  runTimer = setInterval(() => {
    executeStep();
    if (state !== "ejecutando") {
      stopRun();
    }
  }, RUN_DELAY);
}

function resetSystem() {
  stopRun();
  pc = 0;
  ir = 0;
  ac = 0;
  lastModified = null;
  setState("detenido");
  els.consoleOutput.textContent = "Sistema inicializado.\nListo.\n";
  updateInterface();
}

function clearMemory() {
  stopRun();
  memory.fill(0);
  lastModified = null;
  logLine("> CLEAR MEMORY");
  updateInterface();
}

function loadDemo() {
  stopRun();
  memory.fill(0);

  const program = {
    0x00: 0x01, 0x01: 0x20,
    0x02: 0x03, 0x03: 0x21,
    0x04: 0x02, 0x05: 0x22,
    0x06: 0x09, 0x07: 0x22,
    0x08: 0x00, 0x09: 0x00,
    0x20: 0x05,
    0x21: 0x07,
    0x22: 0x00
  };

  Object.entries(program).forEach(([address, value]) => {
    memory[Number(address)] = value;
  });

  pc = 0;
  ir = 0;
  ac = 0;
  lastModified = 0x22;
  setState("detenido");
  els.consoleOutput.textContent = "Demo cargada.\nPrograma: 5 + 7, guarda el resultado en 22 y lo muestra.\n";
  updateInterface();
}

function bindControls() {
  els.loadButton.addEventListener("click", loadSelectedByte);
  els.stepButton.addEventListener("click", executeStep);
  els.runButton.addEventListener("click", runProgram);
  els.stopButton.addEventListener("click", stopRun);
  els.resetButton.addEventListener("click", resetSystem);
  els.clearButton.addEventListener("click", clearMemory);
  els.demoButton.addEventListener("click", loadDemo);
  document.querySelectorAll(".instruction-card").forEach((button) => {
    button.addEventListener("click", () => openInstructionModal(button.dataset.instruction));
  });
  els.modalCloseButton.addEventListener("click", closeInstructionModal);
  els.instructionModal.addEventListener("click", (event) => {
    if (event.target === els.instructionModal) {
      closeInstructionModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.instructionModal.hidden) {
      closeInstructionModal();
    }
  });
}

function init() {
  createSwitches(els.addressSwitches, addressBits, "address");
  createSwitches(els.dataSwitches, dataBits, "data");
  createMemoryTable();
  bindControls();
  resetSystem();
}

init();
