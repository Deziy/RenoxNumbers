const firebaseConfig = {
    apiKey: "AIzaSyCZF_eOPSNYlgD5gUGWO7yOdcRSRIhUzt4",
    authDomain: "nomer-865c9.firebaseapp.com",
    databaseURL: "https://nomer-865c9-default-rtdb.firebaseio.com",
    projectId: "nomer-865c9",
    storageBucket: "nomer-865c9.firebasestorage.app",
    messagingSenderId: "618335821322",
    appId: "1:618335821322:web:fee270b12c36df1e2049f3",
    measurementId: "G-7Z523WYG9S"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let isAdmin = false;
let currentEditId = null;
let tapCount = 0;
let tapTimer;

function secretAdminTap() {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000);
    if (tapCount >= 5) {
        tapCount = 0;
        const pass = prompt("Admin parolini kiriting:");
        if (pass === "renox2026") {
            isAdmin = true;
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminIndicator').style.display = 'block';
            renderTable();
        }
    }
}

function handleAction() {
    const country = document.getElementById('country').value;
    const phone = document.getElementById('phone').value;
    const price = document.getElementById('price').value;
    const status = document.getElementById('status').value;
    if (!country || !phone || !price) return alert("Barcha maydonlarni to'ldiring!");
    const data = { country, phone, price, status };
    if (currentEditId) {
        db.ref('numbers/' + currentEditId).update(data);
        currentEditId = null;
        document.getElementById('actionBtn').innerText = "Saqlash";
    } else {
        db.ref('numbers').push(data);
    }
    document.getElementById('country').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('price').value = '';
}

function deleteData(id) { if (confirm("O'chirilsinmi?")) db.ref('numbers/' + id).remove(); }

function editData(id, c, p, pr, s) {
    document.getElementById('country').value = c;
    document.getElementById('phone').value = p;
    document.getElementById('price').value = pr;
    document.getElementById('status').value = s;
    currentEditId = id;
    document.getElementById('actionBtn').innerText = "Yangilash";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTable() {
    db.ref('numbers').on('value', (snapshot) => {
        const tbody = document.getElementById('dataTable');
        tbody.innerHTML = '';
        snapshot.forEach((child) => {
            const v = child.val();
            const id = child.key;
            const sClass = v.status === "Spamsiz" ? "spamsiz" : "spam";
            
            // SIZ AYTGANINGIZDEK TAYYOR XABAR MATNI
            const textContent = `👋 Assalomu alaykum, yaxshimisiz\n\nMen ${v.country} raqamini sotib olmoqchi edim. Uning narxi ${v.price} so'm ekan\n\nTo'lov qilishim uchun karta raqamingizni yubora olasizmi?`;
            
            const msg = encodeURIComponent(textContent);
            const telLink = `https://t.me/iCrazyKing?text=${msg}`;
            
            let row = `
                <tr>
                    <td><strong>${v.country}</strong></td>
                    <td>${v.phone}</td>
                    <td><span class="badge ${sClass}">${v.status}</span></td>
                    <td class="price-tag">${v.price} UZS</td>
                    <td><a href="${telLink}" class="buy-btn" target="_blank">Sotib olish</a></td>
                    ${isAdmin ? `
                        <td class="admin-only" style="display:table-cell">
                            <button style="color:#fbbf24; background:none; border:none; cursor:pointer;" onclick="editData('${id}', '${v.country}', '${v.phone}', '${v.price}', '${v.status}')">✏️</button>
                            <button style="color:#ef4444; background:none; border:none; cursor:pointer;" onclick="deleteData('${id}')">🗑️</button>
                        </td>` : ''}
                </tr>`;
            tbody.innerHTML += row;
        });
    });
}
renderTable();
