// Grab the two elements we need from the page
const addItemBtn = document.getElementById("add-item-btn");
const itemsBody = document.getElementById("items-body");

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

// Recalculate one row: Qty x Price, shown with 2 decimals
function updateRowTotal(row) {
  const qty = toNumber(row.querySelector(".item-qty").value);
  const price = toNumber(row.querySelector(".item-price").value);
  row.querySelector(".item-total").textContent = (qty * price).toFixed(2);
}

// Run addItemRow every time the button is clicked
addItemBtn.addEventListener("click", addItemRow);

// Listen for typing anywhere inside the table body (works for new rows too)
itemsBody.addEventListener("input", function (event) {
  const row = event.target.closest("tr");
  updateRowTotal(row);
});
