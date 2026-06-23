const input = document.querySelector('#input');
const output = document.querySelector('#output');
const convertButton = document.querySelector('#convert');
const statusText = document.querySelector('#status');
const toast = document.querySelector('#toast');
const modeButtons = document.querySelectorAll('.mode-button');
const inputTitle = document.querySelector('#input-title');
const outputTitle = document.querySelector('#output-title');

let mode = 'text-to-binary';
let toastTimer;

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function textToBinary(text) {
  return Array.from(encoder.encode(text))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryToText(binary) {
  const normalized = binary.trim().replace(/\s+/g, ' ');
  if (!normalized) return '';

  const chunks = normalized.split(' ');
  const invalidChunk = chunks.find((chunk) => !/^[01]{8}$/.test(chunk));

  if (invalidChunk) {
    throw new Error('Le binaire doit être composé de groupes de 8 bits, séparés par des espaces.');
  }

  return decoder.decode(new Uint8Array(chunks.map((chunk) => Number.parseInt(chunk, 2))));
}

function setStatus(message, type = '') {
  statusText.textContent = message;
  statusText.className = type;
}

function showToast(message) {
  toast.textContent = message;
  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 1800);
}

function convert() {
  try {
    output.value = mode === 'text-to-binary' ? textToBinary(input.value) : binaryToText(input.value);
    setStatus(output.value ? 'Conversion terminée avec succès.' : 'Ajoutez du contenu pour convertir.', output.value ? 'success' : '');
  } catch (error) {
    output.value = '';
    setStatus(error.message, 'error');
  }
}

function updateMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
  inputTitle.textContent = mode === 'text-to-binary' ? 'Texte à traduire' : 'Code binaire à traduire';
  outputTitle.textContent = mode === 'text-to-binary' ? 'Code binaire' : 'Texte traduit';
  input.placeholder = mode === 'text-to-binary'
    ? 'Écrivez ou collez votre texte ici...'
    : 'Collez des groupes de 8 bits séparés par des espaces, par exemple : 01000010 01101111 01101110';
  output.value = '';
  setStatus('Mode de conversion mis à jour.');
}

async function copyFrom(target) {
  const value = target === 'input' ? input.value : output.value;
  if (!value) {
    showToast('Rien à copier pour le moment.');
    return;
  }
  await navigator.clipboard.writeText(value);
  showToast(target === 'input' ? 'Texte source copié.' : 'Résultat copié.');
}

async function pasteInput() {
  try {
    input.value = await navigator.clipboard.readText();
    convert();
    showToast('Contenu collé.');
  } catch {
    showToast('Collage indisponible dans ce navigateur.');
  }
}

modeButtons.forEach((button) => button.addEventListener('click', () => updateMode(button.dataset.mode)));
convertButton.addEventListener('click', convert);
input.addEventListener('input', convert);
document.querySelector('[data-clear]').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  setStatus('Champs effacés.');
});
document.querySelector('[data-paste]').addEventListener('click', pasteInput);
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', () => copyFrom(button.dataset.copy));
});
