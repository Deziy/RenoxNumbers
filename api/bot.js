const { Telegraf, Markup } = require('telegraf');
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

// Raqamli ID ishlatilganda, havolada username ishlatishimiz kerak
const KANAL_ID = "-1003719846603"; 
const KANAL_LINK = "RenoxNumbers"; // Kanal yuzerini buni ichiga @ siz yozing

bot.start(async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        const isAdminOrMember = ['creator', 'administrator', 'member'].includes(member.status);

        if (!isAdminOrMember) {
            return ctx.reply(`👋 Assalomu alaykum! Botdan foydalanish uchun kanalimizga obuna bo'ling:`, 
                Markup.inlineKeyboard([
                    [Markup.url.button("Obuna bo'lish", `https://t.me/${KANAL_LINK}`)],
                    [Markup.callback.button("Tekshirish ✅", "check_sub")]
                ])
            );
        }

        return ctx.reply("Xush kelibsiz! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring:", 
            Markup.keyboard([
                [Markup.button.contactRequest("📱 Kontaktni yuborish")]
            ]).resize().oneTime()
        );
    } catch (e) {
        console.error(e);
        return ctx.reply("Xatolik: Bot kanalda admin emas yoki ID noto'g'ri.");
    }
});

bot.action('check_sub', async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        const isAdminOrMember = ['creator', 'administrator', 'member'].includes(member.status);

        if (isAdminOrMember) {
            await ctx.answerCbQuery("Rahmat! ✅");
            return ctx.reply("Tabriklaymiz! Endi /start bosing.");
        } else {
            await ctx.answerCbQuery("Siz hali a'zo bo'lmadingiz! ❌", { show_alert: true });
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
        await db.ref('users/' + userId).set({
            phone: phone,
            name: userName,
            userId: userId,
            registeredAt: new Date().toISOString()
        });

        return ctx.reply(`Tabriklaymiz, ${userName}! ✅\nSiz muvaffaqiyatli ro'yxatdan o'tdingiz.\n\nEndi saytimizga kirib o'z profilingizni ulashingiz mumkin:\nhttps://deziy.vercel.app`,
            Markup.inlineKeyboard([
                [Markup.url.button("Saytga o'tish", "https://deziy.vercel.app")]
            ])
        );
    } catch (err) {
        return ctx.reply("Ma'lumotlarni saqlashda xatolik: " + err.message);
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
