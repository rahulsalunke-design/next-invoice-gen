# Invoice Generator

A simple invoice generator built with plain HTML, CSS and JavaScript. No frameworks, no build step, no server.

## About this project

This is an **experiment**. The goal was to learn how GitHub works (branches, commits, pull requests, merging and tags) while building something real.

The invoice generator was built **from scratch, step by step**, not from one big prompt. Each feature was a separate, small request (a multi-shot prompt approach), and each step was explained, tested and committed before moving on. The commit history shows how the app grew:

1. Invoice layout and add-item row
2. Live row total calculation
3. Invoice totals (subtotal, discount, tax, grand total)
4. Delete button for item rows
5. Draft saving with `localStorage` and a Clear invoice button
6. Drag-and-drop row reordering

## Features

- Editable "Bill to" details (name, address, email)
- Add and delete item rows (description, quantity, price)
- Live row totals and invoice totals: subtotal, discount %, tax %, grand total
- Drag rows by the handle in the first column to reorder them
- Autosave: everything is stored in your browser and comes back when you reopen the page
- Clear invoice button (asks for confirmation first)

## How to run

1. Download or clone this repository.
2. Open `index.html` in any browser.

That's it.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page structure |
| `style.css` | The look and layout |
| `script.js` | All the behavior: rows, totals, saving, drag and drop |

## Notes

- The draft is saved in your browser's `localStorage`, so it stays on your computer and in that browser only.
- Not included yet: printing, PDF export, invoice numbers and dates that change.

## Workflow used

Work was done on a `test` branch, merged into `main` with a pull request, and the result was tagged `v1.0`.
