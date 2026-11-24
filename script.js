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
    <td class="item-total">0</td>
  `;

  itemsBody.appendChild(row);
}

// Run addItemRow every time the button is clicked
addItemBtn.addEventListener("click", addItemRow);
