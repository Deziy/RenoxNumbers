const firebaseConfig = {
    databaseURL: "https://nomer-865c9-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Profilni ochish/yopish
function toggleProfile() {
    const modal = document.getElementById('profileModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

// Kirish funksiyasi
function loginUser() {
    const phone = document.getElementById('userPhoneInput').value.trim();
    
    db.ref('users').orderByChild('phone').equalTo(phone).once('value', (snapshot) => {
        if (snapshot.exists()) {
            let userData;
            snapshot.forEach(child => { userData = child.val(); });
            
            localStorage.setItem('renox_user', JSON.stringify(userData));
            updateUI(userData);
        } else {
            alert("Raqam topilmadi! Avval botdan ro'yxatdan o'ting.");
        }
    });
}

// UI yangilash
function updateUI(user) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('welcomeUser').innerText = "Salom, " + user.name;
    
    loadPromos(user.userId);
}

// Promokodlarni yuklash
function loadPromos(userId) {
    const promoList = document.getElementById('promoList');
    promoList.innerHTML = '';

    db.ref('promos/' + userId).on('value', (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const promo = child.val();
                promoList.innerHTML += `
                    <div class="promo-item">
                        <span>${promo.code}</span>
                        <span>-${promo.discount}%</span>
                    </div>`;
            });
        } else {
            promoList.innerHTML = '<p>Hozircha promokodlar yo\'q</p>';
        }
    });
}

// Chiqish
function logout() {
    localStorage.removeItem('renox_user');
    location.reload();
}

// Sahifa yuklanganda sessiyani tekshirish
window.onload = () => {
    const savedUser = localStorage.getItem('renox_user');
    if (savedUser) updateUI(JSON.parse(savedUser));
};
