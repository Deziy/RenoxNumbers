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

const KANAL_ID = "@RenoxNumbers"; // Kanalingiz yuzeri to'g'riligini tekshiring

bot.start(async (ctx) => {
    try {
        // Kanalga a'zolikni tekshirish
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        const isAdminOrMember = ['creator', 'administrator', 'member'].includes(member.status);

        if (!isAdminOrMember) {
            return ctx.reply(`👋 Assalomu alaykum! Botdan foydalanish uchun kanalimizga obuna bo'ling:`, 
                Markup.inlineKeyboard([
                    [Markup.url.button("Obuna bo'lish", `https://t.me/${KANAL_ID.replace('@', '')}`)],
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
        console.error("Start error:", e);
        return ctx.reply("Xatolik: Kanalni topa olmadim yoki bot kanalda admin emas.");
    }
});

bot.action('check_sub', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("Obunani tekshirish uchun qaytadan /start bosing.");
});

bot.on('contact', async (ctx) => {
    const phone = ctx.message.contact.phone_number;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || "User";

    try {
        // Foydalanuvchini bazaga saqlash
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
        console.error("Database save error:", err);
        return ctx.reply("Ma'lumotlarni saqlashda xatolik yuz berdi: " + err.message);
    }
});

// Vercel Serverless Function export
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error("Webhook error:", err);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Renox Bot Active');
    }
};
