const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db');
const UserModel = require('./models');

const token = '6009643914:AAEjAlj3DXmQkuVyg2XoEZMCdG9plGvxDMY'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Отгадывай`, gameOptions)
}

const start = async () => {

    // Деплоим бота на сервер
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к бд сломалось');
    }

    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Информация о вас'},
        {command: '/game', description: 'Игра угадай цифру'},

    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                // await UserModel.create({chatId})
                await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/775/a00/775a004a-7665-4a7e-8693-f12839e4bc04/1.webp`);
                return bot.sendMessage(chatId, `Добро пожаловть в телеграм бот, ${msg.from.first_name}`);
            }
            if(text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`);
            }
            if(text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!')
        } catch (e) {
            return bot.sendMessage(chatId, `Произошла ошибочка!`)
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if(data == chats[chatId]) {
            user.right += 1;
            await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/775/a00/775a004a-7665-4a7e-8693-f12839e4bc04/5.webp`)
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/775/a00/775a004a-7665-4a7e-8693-f12839e4bc04/10.webp`)
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })

}

start()
