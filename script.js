// Ma'lumotlarni jadvalga qo'shish funksiyasi
function renderRow(key, data) {
    const table = document.getElementById('dataTable');
    const row = document.createElement('tr');
    
    // Muhim: data-label CSS dagi sarlavhalar uchun xizmat qiladi
    row.innerHTML = `
        <td data-label="Davlat">${data.country}</td>
        <td data-label="Raqam">${data.phone}</td>
        <td data-label="Holati">${data.status}</td>
        <td data-label="Narxi">${data.price} UZS</td>
        <td data-label="Amal">
            <button class="buy-btn" onclick="order('${key}')">Sotib olish</button>
        </td>
        <td class="admin-only" data-label="Admin">
            <button onclick="edit('${key}')">✏️</button>
            <button onclick="remove('${key}')">🗑️</button>
        </td>
    `;
    table.appendChild(row);
}

// Admin panelni ochish (Secret tap)
let tapCount = 0;
function secretAdminTap() {
    tapCount++;
    if (tapCount >= 5) {
        const pass = prompt("Admin parolini kiriting:");
        if (pass === "renox2026") {
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminIndicator').style.display = 'block';
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'table-cell');
        }
        tapCount = 0;
    }
}
