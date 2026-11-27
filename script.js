// Grab the elements we need from the page
const addItemBtn = document.getElementById("add-item-btn");
const itemsBody = document.getElementById("items-body");
const discountInput = document.getElementById("discount-percent");
const taxInput = document.getElementById("tax-percent");
const subtotalEl = document.getElementById("subtotal");
const discountAmountEl = document.getElementById("discount-amount");
const taxAmountEl = document.getElementById("tax-amount");
const grandTotalEl = document.getElementById("grand-total");

const clearBtn = document.getElementById("clear-btn");
const clientNameInput = document.getElementById("client-name");
const clientAddressInput = document.getElementById("client-address");
const clientEmailInput = document.getElementById("client-email");

const invoiceNumberInput = document.getElementById("invoice-number");
const issueDateInput = document.getElementById("issue-date");
const dueDateInput = document.getElementById("due-date");

const currencySelect = document.getElementById("currency");

// Which locale formats each currency (controls symbol position and separators)
const CURRENCY_LOCALES = {
  USD: "en-US",
  EUR: "de-DE",
  INR: "en-IN",
  GBP: "en-GB",
};

// Turn a number into money text for the chosen currency, e.g. ₹1,23,456.00
function formatMoney(amount) {
  const currency = currencySelect.value || "USD";
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency: currency,
  }).format(amount);
}

const logoPreview = document.getElementById("logo-preview");
const logoFileInput = document.getElementById("logo-file");
const logoBtn = document.getElementById("logo-btn");
const logoRemoveBtn = document.getElementById("logo-remove-btn");
const logoMessage = document.getElementById("logo-message");

// Biggest logo file we accept (500 KB)
const MAX_LOGO_BYTES = 500 * 1024;

// The logo as a data URL (the image written as text). Empty means no logo.
let logoDataUrl = "";

// Show the logo (or hide everything logo-related when given empty text)
function showLogo(dataUrl) {
  logoDataUrl = dataUrl;
  if (dataUrl) {
    logoPreview.src = dataUrl;
  } else {
    logoPreview.removeAttribute("src");
  }
  logoPreview.hidden = !dataUrl;
  logoRemoveBtn.hidden = !dataUrl;
}

// Today's date as YYYY-MM-DD (the format date inputs use), from the local clock
function todayAsText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// The name under which the draft is stored in the browser
const STORAGE_KEY = "invoice-draft";

// Build a new row and add it to the table body.
// With no argument it is an empty row. With saved data it is filled in.
function addItemRow(item) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="move-cell">
      <span class="drag-handle" draggable="true" title="Drag to reorder" aria-label="Drag to reorder">⋮⋮</span>
    </td>
    <td><input type="text" class="item-description" placeholder="Name"></td>
    <td><input type="number" class="item-qty" value="1"></td>
    <td><input type="number" class="item-price" value="0"></td>
    <td class="item-total">0.00</td>
    <td><button type="button" class="delete-btn" aria-label="Delete row">×</button></td>
  `;

  if (item) {
    row.querySelector(".item-description").value = String(item.description ?? "");
    row.querySelector(".item-qty").value = String(item.qty ?? "1");
    row.querySelector(".item-price").value = String(item.price ?? "0");
  }

  itemsBody.appendChild(row);
}

// Turn whatever was typed into a number. Empty or invalid becomes 0.
function toNumber(text) {
  const number = parseFloat(text);
  return isNaN(number) ? 0 : number;
}

// Recalculate one row: Qty x Price, shown with 2 decimals.
// It also returns the total as a number so the subtotal can add it up.
function updateRowTotal(row) {
  const qty = toNumber(row.querySelector(".item-qty").value);
  const price = toNumber(row.querySelector(".item-price").value);
  const total = qty * price;
  row.querySelector(".item-total").textContent = formatMoney(total);
  return total;
}

// The ONE function that recalculates everything on the invoice
function recalculateTotals() {
  // 1. Update every row and add up their totals
  const rows = Array.from(itemsBody.querySelectorAll("tr"));
  const subtotal = rows.reduce(function (sum, row) {
    return sum + updateRowTotal(row);
  }, 0);

  // 2. Read the discount % and tax %
  const discountPercent = toNumber(discountInput.value);
  const taxPercent = toNumber(taxInput.value);

  // 3. Do the math in the right order
  const discountAmount = subtotal * discountPercent / 100;
  const discounted = subtotal - discountAmount;
  const taxAmount = discounted * taxPercent / 100;
  const grandTotal = discounted + taxAmount;

  // 4. Show everything as money in the chosen currency
  subtotalEl.textContent = formatMoney(subtotal);
  discountAmountEl.textContent = formatMoney(discountAmount);
  taxAmountEl.textContent = formatMoney(taxAmount);
  grandTotalEl.textContent = formatMoney(grandTotal);
}

// FUNCTION 1: read the page into a plain JavaScript object
function readInvoiceFromPage() {
  const rows = Array.from(itemsBody.querySelectorAll("tr"));

  return {
    invoiceNumber: invoiceNumberInput.value,
    issueDate: issueDateInput.value,
    dueDate: dueDateInput.value,
    currency: currencySelect.value,
    logo: logoDataUrl,
    billTo: {
      name: clientNameInput.value,
      address: clientAddressInput.value,
      email: clientEmailInput.value,
    },
    items: rows.map(function (row) {
      return {
        description: row.querySelector(".item-description").value,
        qty: row.querySelector(".item-qty").value,
        price: row.querySelector(".item-price").value,
      };
    }),
    discountPercent: discountInput.value,
    taxPercent: taxInput.value,
  };
}

// FUNCTION 2: save that object in the browser as text
function saveInvoice() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readInvoiceFromPage()));
  } catch (error) {
    // Storage can be full or blocked. The invoice still works, it just won't be saved.
  }
}

// Put the page back to the empty starting state: one empty row, blank fields
function resetPage() {
  itemsBody.innerHTML = "";
  invoiceNumberInput.value = "INV-001";
  issueDateInput.value = todayAsText();
  dueDateInput.value = "";
  currencySelect.value = "USD";
  showLogo("");
  logoMessage.textContent = "";
  clientNameInput.value = "";
  clientAddressInput.value = "";
  clientEmailInput.value = "";
  discountInput.value = "0";
  taxInput.value = "0";
  addItemRow();
  recalculateTotals();
}

// FUNCTION 3: load the saved object and rebuild the page from it
function loadInvoice() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      resetPage(); // first visit: nothing saved yet
      return;
    }

    const data = JSON.parse(saved);

    itemsBody.innerHTML = "";
    invoiceNumberInput.value = String(data.invoiceNumber ?? "INV-001");
    issueDateInput.value = String(data.issueDate ?? todayAsText());
    dueDateInput.value = String(data.dueDate ?? "");
    currencySelect.value = String(data.currency ?? "USD");
    if (!currencySelect.value) {
      currencySelect.value = "USD"; // saved value is not in the list
    }
    const savedLogo = typeof data.logo === "string" && data.logo.startsWith("data:image/") ? data.logo : "";
    showLogo(savedLogo);
    clientNameInput.value = String(data.billTo.name ?? "");
    clientAddressInput.value = String(data.billTo.address ?? "");
    clientEmailInput.value = String(data.billTo.email ?? "");
    discountInput.value = String(data.discountPercent ?? "0");
    taxInput.value = String(data.taxPercent ?? "0");

    data.items.forEach(function (item) {
      addItemRow(item);
    });

    // Never leave the table empty
    if (itemsBody.children.length === 0) {
      addItemRow();
    }

    recalculateTotals();
  } catch (error) {
    // Saved data was broken or unreadable: start fresh instead of crashing
    resetPage();
  }
}

// Run addItemRow every time the button is clicked, then save
addItemBtn.addEventListener("click", function () {
  addItemRow();
  saveInvoice();
});

// Typing in ANY field on the page saves the draft
document.addEventListener("input", saveInvoice);

// Clear invoice: ask first, then wipe the saved draft and reset the page
clearBtn.addEventListener("click", function () {
  if (!confirm("Clear the whole invoice? This cannot be undone.")) {
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // nothing to do if storage is unavailable
  }
  resetPage();
});

// Print / Save as PDF: open the browser's print dialog
document.getElementById("print-btn").addEventListener("click", function () {
  window.print();
});

// PREVIEW MODE: show the invoice as a clean, read-only document
const previewBtn = document.getElementById("preview-btn");
const PREVIEW_SECTIONS = ".invoice-meta, .bill-to, .items, .totals";

previewBtn.addEventListener("click", function () {
  const isPreview = document.body.classList.toggle("preview");
  previewBtn.textContent = isPreview ? "Back to edit" : "Preview";

  // "inert" makes a section impossible to click, focus or edit
  document.querySelectorAll(PREVIEW_SECTIONS).forEach(function (section) {
    section.inert = isPreview;
  });
});

// Typing in any row (works for new rows too) recalculates everything
itemsBody.addEventListener("input", recalculateTotals);

// DRAG AND DROP: reorder rows by dragging the ⋮⋮ handle
let draggedRow = null; // the row being dragged right now

// Start: only the handle is draggable, so we know which row was grabbed
itemsBody.addEventListener("dragstart", function (event) {
  const handle = event.target.closest(".drag-handle");
  if (!handle) {
    return;
  }
  draggedRow = handle.closest("tr");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", ""); // Firefox needs some data to start a drag
  event.dataTransfer.setDragImage(draggedRow, 20, 20); // drag the whole row, not just the handle
  draggedRow.classList.add("dragging");
});

// Moving over other rows: put the dragged row above or below the row under the pointer
itemsBody.addEventListener("dragover", function (event) {
  if (!draggedRow) {
    return;
  }
  event.preventDefault(); // this says "you may drop here"

  const overRow = event.target.closest("tr");
  if (!overRow || overRow === draggedRow) {
    return;
  }

  const box = overRow.getBoundingClientRect();
  const inTopHalf = event.clientY < box.top + box.height / 2;

  if (inTopHalf) {
    itemsBody.insertBefore(draggedRow, overRow);
  } else {
    itemsBody.insertBefore(draggedRow, overRow.nextElementSibling);
  }
});

// Drop: the row is already in its new place, so just save
itemsBody.addEventListener("drop", function (event) {
  event.preventDefault();
});

// End (drop or cancel): clean up and save the new order
itemsBody.addEventListener("dragend", function () {
  if (draggedRow) {
    draggedRow.classList.remove("dragging");
    draggedRow = null;
    saveInvoice();
  }
});

// Clicking a Delete button anywhere in the table body removes its row
itemsBody.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".delete-btn");
  if (!deleteBtn) {
    return; // the click was not on a Delete button
  }

  deleteBtn.closest("tr").remove();

  // Never leave the table empty: add a fresh row if the last one was deleted
  if (itemsBody.children.length === 0) {
    addItemRow();
  }

  recalculateTotals();
  saveInvoice();
});

// LOGO UPLOAD: the visible button opens the hidden file picker
logoBtn.addEventListener("click", function () {
  logoFileInput.click();
});

// A file was chosen: check it, read it as a data URL, show it and save it
logoFileInput.addEventListener("change", function () {
  const file = logoFileInput.files[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    logoMessage.textContent = "Please choose an image file (PNG, JPG, SVG, ...).";
    logoFileInput.value = "";
    return;
  }

  if (file.size > MAX_LOGO_BYTES) {
    const sizeKb = Math.round(file.size / 1024);
    logoMessage.textContent = "That image is " + sizeKb + " KB. Please choose one under 500 KB.";
    logoFileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", function () {
    showLogo(String(reader.result));
    logoMessage.textContent = "";
    saveInvoice();
  });
  reader.addEventListener("error", function () {
    logoMessage.textContent = "Sorry, that file could not be read. Please try another image.";
  });
  reader.readAsDataURL(file);

  // Reset the picker so choosing the same file again still triggers "change"
  logoFileInput.value = "";
});

// Remove the logo and save
logoRemoveBtn.addEventListener("click", function () {
  showLogo("");
  logoMessage.textContent = "";
  saveInvoice();
});

// Changing the currency redraws every money value
currencySelect.addEventListener("change", recalculateTotals);

// Changing the discount or tax recalculates everything too
discountInput.addEventListener("input", recalculateTotals);
taxInput.addEventListener("input", recalculateTotals);

// When the page opens, bring back the saved draft (or start empty)
loadInvoice();
