const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// Firebase-ni faollashtirish
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://nomer-865c9-default-rtdb.firebaseio.com"
        });
    } catch (error) {
        console.error("Firebase init error:", error);
    }
}

const db = admin.database();
const bot = new Telegraf(process.env.BOT_TOKEN);

const KANAL_ID = "-1003719846603"; 
const KANAL_USERNAME = "RenoxNumbers"; 

bot.start(async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        const isMember = ['creator', 'administrator', 'member'].includes(member.status);

        if (!isMember) {
            return ctx.reply(`👋 Assalomu alaykum! Botdan foydalanish uchun kanalimizga obuna bo'ling:`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Obuna bo'lish", url: `https://t.me/${KANAL_USERNAME}` }],
                        [{ text: "Tekshirish ✅", callback_data: "check_sub" }]
                    ]
                }
            });
        }

        return ctx.reply("Xush kelibsiz! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring:", {
            reply_markup: {
                keyboard: [[{ text: "📱 Kontaktni yuborish", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });

    } catch (e) {
        // Kanalda xato bo'lsa ham kontakt tugmasini chiqaramiz
        return ctx.reply("Telefon raqamingizni yuboring:", {
            reply_markup: {
                keyboard: [[{ text: "📱 Kontaktni yuborish", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

bot.action('check_sub', async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        if (['creator', 'administrator', 'member'].includes(member.status)) {
            await ctx.answerCbQuery("Rahmat! ✅");
            return ctx.reply("Endi qaytadan /start bosing.");
        } else {
            await ctx.answerCbQuery("Siz hali a'zo emassiz! ❌", { show_alert: true });
        }
    } catch (e) {
        await ctx.answerCbQuery("Xatolik yuz berdi.");
    }
});

bot.on('contact', async (ctx) => {
    const phone = ctx.message.contact.phone_number;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || "User";

    try {
        // Firebase-ga saqlash
        await db.ref('users/' + userId).set({
            phone: phone,
            name: userName,
            userId: userId,
            registeredAt: new Date().toISOString()
        });

        // Muvaffaqiyatli saqlangandan keyin javob berish
        return ctx.reply(`Tabriklaymiz, ${userName}! ✅\nSiz muvaffaqiyatli ro'yxatdan o'tdingiz.\n\nEndi saytimizga kirib profilingizni ulashingiz mumkin:\nhttps://deziy.vercel.app`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Saytga o'tish", url: "https://deziy.vercel.app" }]
                ]
            }
        });
    } catch (err) {
        console.error("Firebase save error:", err);
        return ctx.reply("Ma'lumotlarni saqlashda xato: " + err.message);
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Renox Bot Active');
    }
};
