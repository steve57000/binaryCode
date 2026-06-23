(function initializeBinaryCode(globalScope) {
  'use strict';

  const MODE_TEXT_TO_BINARY = 'text-to-binary';
  const MODE_BINARY_TO_TEXT = 'binary-to-text';
  const BYTE_PATTERN = /^[01]{8}$/;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });

  function textToBinary(text) {
    return Array.from(encoder.encode(String(text)))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join(' ');
  }

  function normalizeBinary(binary) {
    return String(binary).trim().replace(/[,_;|]+/g, ' ').replace(/\s+/g, ' ');
  }

  function binaryToText(binary) {
    const normalized = normalizeBinary(binary);
    if (!normalized) return '';

    const chunks = normalized.split(' ');
    const invalidChunk = chunks.find((chunk) => !BYTE_PATTERN.test(chunk));

    if (invalidChunk) {
      throw new Error('Le binaire doit contenir uniquement des groupes de 8 bits, séparés par des espaces.');
    }

    return decoder.decode(new Uint8Array(chunks.map((chunk) => Number.parseInt(chunk, 2))));
  }

  function getStats(value, currentMode) {
    const content = String(value);
    if (!content) return '0 caractère';

    if (currentMode === MODE_BINARY_TO_TEXT) {
      const groups = normalizeBinary(content).split(' ').filter(Boolean).length;
      return `${groups} octet${groups > 1 ? 's' : ''}`;
    }

    const chars = [...content].length;
    const bytes = encoder.encode(content).length;
    return `${chars} caractère${chars > 1 ? 's' : ''} · ${bytes} octet${bytes > 1 ? 's' : ''}`;
  }

  function boot() {
    const input = document.querySelector('#input');
    const output = document.querySelector('#output');
    const convertButton = document.querySelector('#convert');
    const statusText = document.querySelector('#status');
    const toast = document.querySelector('#toast');
    const modeButtons = document.querySelectorAll('.mode-button');
    const inputTitle = document.querySelector('#input-title');
    const outputTitle = document.querySelector('#output-title');
    const inputStats = document.querySelector('#input-stats');
    const outputStats = document.querySelector('#output-stats');

    let mode = MODE_TEXT_TO_BINARY;
    let toastTimer;

    function setStatus(message, type = '') {
      statusText.textContent = message;
      statusText.className = type;
    }

    function updateStats() {
      inputStats.textContent = getStats(input.value, mode);
      outputStats.textContent = getStats(output.value, mode === MODE_TEXT_TO_BINARY ? MODE_BINARY_TO_TEXT : MODE_TEXT_TO_BINARY);
    }

    function showToast(message) {
      toast.textContent = message;
      toast.setAttribute('aria-hidden', 'false');
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.setAttribute('aria-hidden', 'true');
      }, 2200);
    }

    function convert() {
      try {
        output.value = mode === MODE_TEXT_TO_BINARY ? textToBinary(input.value) : binaryToText(input.value);
        setStatus(output.value ? 'Conversion terminée avec succès.' : 'Ajoutez du contenu pour convertir.', output.value ? 'success' : '');
      } catch (error) {
        output.value = '';
        setStatus(error.message, 'error');
      }
      updateStats();
    }

    function updateMode(nextMode) {
      mode = nextMode;
      modeButtons.forEach((button) => {
        const isActive = button.dataset.mode === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      inputTitle.textContent = mode === MODE_TEXT_TO_BINARY ? 'Texte à traduire' : 'Code binaire à traduire';
      outputTitle.textContent = mode === MODE_TEXT_TO_BINARY ? 'Code binaire' : 'Texte traduit';
      input.placeholder = mode === MODE_TEXT_TO_BINARY
        ? 'Écrivez ou collez votre texte ici…'
        : 'Collez des groupes de 8 bits : 01000010 01101111 01101110';
      output.value = '';
      setStatus('Mode de conversion mis à jour.');
      convert();
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
      updateStats();
    });
    document.querySelector('[data-paste]').addEventListener('click', pasteInput);
    document.querySelectorAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', () => copyFrom(button.dataset.copy));
    });

    updateStats();
  }

  const api = { binaryToText, getStats, normalizeBinary, textToBinary };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope.document) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
}(typeof globalThis !== 'undefined' ? globalThis : window));
