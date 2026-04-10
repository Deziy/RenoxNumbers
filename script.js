const firebaseConfig = {
    databaseURL: "https://nomer-865c9-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 1. Raqamlarni Firebase'dan yuklash
function loadNumbers() {
    const grid = document.getElementById('numbersGrid');
    
    // 'inventory' papkasini eshitamiz
    db.ref('inventory').on('value', (snapshot) => {
        grid.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const item = child.val();
                grid.innerHTML += `
                    <div class="number-card">
                        <div style="font-size: 2rem;">🌍</div>
                        <h3>${item.phone}</h3>
                        <p class="price">${item.price} UZS</p>
                        <p style="color: #aaa; margin-bottom: 15px;">Holati: ${item.status || 'Sotuvda'}</p>
                        <button class="action-btn" onclick="buyNumber('${child.key}')">Sotib olish</button>
                    </div>`;
            });
        } else {
            grid.innerHTML = '<p>Hozircha raqamlar yo\'q. Firebase-ga "inventory" papkasi orqali qo\'shing.</p>';
        }
    });
}

// 2. Profil va Kirish
function toggleProfile() {
    const modal = document.getElementById('profileModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function loginUser() {
    const phone = document.getElementById('userPhoneInput').value.trim();
    db.ref('users').orderByChild('phone').equalTo(phone).once('value', (snapshot) => {
        if (snapshot.exists()) {
            let userData;
            snapshot.forEach(c => { userData = c.val(); });
            localStorage.setItem('renox_user', JSON.stringify(userData));
            updateUI(userData);
        } else {
            alert("Raqam topilmadi! Avval botdan ro'yxatdan o'ting.");
        }
    });
}

function updateUI(user) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('welcomeUser').innerText = "Salom, " + user.name;
    loadPromos(user.userId);
}

function loadPromos(userId) {
    const promoList = document.getElementById('promoList');
    db.ref('promos/' + userId).on('value', (snapshot) => {
        promoList.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const p = child.val();
                promoList.innerHTML += `<div style="background: white; color: black; padding: 10px; border-radius: 8px; margin: 5px 0;">
                    <b>${p.code}</b> - ${p.discount}% chegirma
                </div>`;
            });
        } else {
            promoList.innerHTML = '<p>Promokodlar mavjud emas</p>';
        }
    });
}

function logout() {
    localStorage.removeItem('renox_user');
    location.reload();
}

// 3. Sotib olish (oddiy xabar)
function buyNumber(key) {
    alert("Sotib olish uchun adminga murojaat qiling: @RenoxNumbersAdmin");
}

window.onload = () => {
    loadNumbers();
    const savedUser = localStorage.getItem('renox_user');
    if (savedUser) updateUI(JSON.parse(savedUser));
};
