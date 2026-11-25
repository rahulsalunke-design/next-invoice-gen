// Grab the elements we need from the page
const addItemBtn = document.getElementById("add-item-btn");
const itemsBody = document.getElementById("items-body");
const discountInput = document.getElementById("discount-percent");
const taxInput = document.getElementById("tax-percent");
const subtotalEl = document.getElementById("subtotal");
const discountAmountEl = document.getElementById("discount-amount");
const taxAmountEl = document.getElementById("tax-amount");
const grandTotalEl = document.getElementById("grand-total");

// Build a new empty row and add it to the table body
function addItemRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" class="item-description" placeholder="Description"></td>
    <td><input type="number" class="item-qty" value="1"></td>
    <td><input type="number" class="item-price" value="0"></td>
    <td class="item-total">0.00</td>
  `;

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

// Run addItemRow every time the button is clicked
addItemBtn.addEventListener("click", addItemRow);

// Typing in any row (works for new rows too) recalculates everything
itemsBody.addEventListener("input", recalculateTotals);

// Changing the discount or tax recalculates everything too
discountInput.addEventListener("input", recalculateTotals);
taxInput.addEventListener("input", recalculateTotals);
