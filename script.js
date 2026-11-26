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

// The name under which the draft is stored in the browser
const STORAGE_KEY = "invoice-draft";

// Build a new row and add it to the table body.
// With no argument it is an empty row. With saved data it is filled in.
function addItemRow(item) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" class="item-description" placeholder="Description"></td>
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
  row.querySelector(".item-total").textContent = total.toFixed(2);
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

  // 4. Show everything with 2 decimals
  subtotalEl.textContent = subtotal.toFixed(2);
  discountAmountEl.textContent = discountAmount.toFixed(2);
  taxAmountEl.textContent = taxAmount.toFixed(2);
  grandTotalEl.textContent = grandTotal.toFixed(2);
}

// FUNCTION 1: read the page into a plain JavaScript object
function readInvoiceFromPage() {
  const rows = Array.from(itemsBody.querySelectorAll("tr"));

  return {
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

// Typing in any row (works for new rows too) recalculates everything
itemsBody.addEventListener("input", recalculateTotals);

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

// Changing the discount or tax recalculates everything too
discountInput.addEventListener("input", recalculateTotals);
taxInput.addEventListener("input", recalculateTotals);

// When the page opens, bring back the saved draft (or start empty)
loadInvoice();
