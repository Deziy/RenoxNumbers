const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// Firebase-ni faollashtirish
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        databaseURL: "https://nomer-865c9-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();
const bot = new Telegraf(process.env.BOT_TOKEN);

const KANAL_ID = "@RenoxNumbers"; // O'zingizning kanalingiz yuzerini shu yerga yozing

bot.start(async (ctx) => {
    try {
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
        return ctx.reply("Xatolik: Kanalni topa olmadim yoki bot kanalda admin emas.");
    }
});

// "Tekshirish" tugmasi bosilganda
bot.action('check_sub', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Tekshirilmoqda...");
    // Qayta start buyrug'ini yuborganidek ishlaydi
    return ctx.reply("Tekshirish uchun qaytadan /start bosing.");
});

bot.on('contact', async (ctx) => {
    const phone = ctx.message.contact.phone_number;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    try {
        // Firebase-ga foydalanuvchini saqlash
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
        return ctx.reply("Ma'lumotlarni saqlashda xatolik yuz berdi.");
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
