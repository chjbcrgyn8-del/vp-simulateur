/* Saisie décimale française commune. Vide / invalide n'est jamais zéro. */
(() => {
 'use strict';
 function parse(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const text=value.trim().replace(/−/g,'-');
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) return null;
  const number=Number(text.replace(',','.'));
  return Number.isFinite(number) ? number : null;
 }
 window.VPNumber=Object.freeze({parse});
})();