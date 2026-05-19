const xlsx = require('xlsx');
const fs = require('fs');

// Users template
const wb1 = xlsx.utils.book_new();
const ws1 = xlsx.utils.json_to_sheet([
  { 'Name': 'Diana QA', 'Email': 'diana@stitch.com', 'Role': 'USER', 'Manager Email': 'admin@stitch.com' },
  { 'Name': 'Eve DevOps', 'Email': 'eve@stitch.com', 'Role': 'USER', 'Manager Email': 'admin@stitch.com' }
]);
xlsx.utils.book_append_sheet(wb1, ws1, 'Users');
xlsx.writeFile(wb1, 'frontend/public/templates/bulk_users_template.xlsx');

// Time entries template
const wb2 = xlsx.utils.book_new();
const ws2 = xlsx.utils.json_to_sheet([
  { 'Date': '2026-05-15', 'Employee Email': 'alice@stitch.com', 'Project': 'Stitch Dashboard', 'Phase': 'Build', 'Hours': 8, 'Task Description': 'Sprint planning session' },
  { 'Date': '2026-05-15', 'Employee Email': 'bob@stitch.com', 'Project': 'Enterprise API', 'Phase': 'Build', 'Hours': 6, 'Task Description': 'Database schema migration' }
]);
xlsx.utils.book_append_sheet(wb2, ws2, 'Entries');
xlsx.writeFile(wb2, 'frontend/public/templates/bulk_time_entries_template.xlsx');
