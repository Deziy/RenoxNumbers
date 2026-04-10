const { Telegraf, Markup } = require('telegraf');

// Bu yerda biz Vercel-dagi Environment Variables-dan foydalanamiz
const bot = new Telegraf(process.env.BOT_TOKEN);
const KANAL_ID = "@RenoxNumbers"; // O'zingizning kanalingiz yuzerini yozing

bot.start(async (ctx) => {
    // Kanalga a'zolikni tekshirish
    try {
        const member = await ctx.telegram.getChatMember(KANAL_ID, ctx.from.id);
        const isAdminOrMember = ['creator', 'administrator', 'member'].includes(member.status);

        if (!isAdminOrMember) {
            return ctx.reply(👋 Assalomu alaykum! Botdan foydalanish uchun kanalimizga obuna bo'ling:, 
                Markup.inlineKeyboard([
                    [Markup.url.button("Obuna bo'lish", https://t.me/${KANAL_ID.replace('@', '')})],
                    [Markup.callback.button("Tekshirish ✅", "check_sub")]
                ])
            );
        }

        // Agar a'zo bo'lsa, kontakt so'raymiz
        return ctx.reply("Xush kelibsiz! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring:", 
            Markup.keyboard([
                [Markup.button.contactRequest("📱 Kontaktni yuborish")]
            ]).resize().oneTime()
        );
    } catch (e) {
        return ctx.reply("Xatolik yuz berdi. Kanal ID to'g'ri kiritilganini tekshiring.");
    }
});

bot.on('contact', async (ctx) => {
    // Bu yerda kontaktni Firebase-ga saqlash qismi bo'ladi
    ctx.reply("Rahmat! Siz muvaffaqiyatli ro'yxatdan o'tdingiz. ✅\nEndi saytimizga kiring: https://deziy.vercel.app");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Bot ishlayapti...');
    }
};
