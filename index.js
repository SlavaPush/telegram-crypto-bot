/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
/* eslint-disable spaced-comment */
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const CoinMarketCap = require('coinmarketcap-api');
require('dotenv').config();
const { toCurrency, toNum } = require('./helpers');
const currencyBoard = require('./currencyBoard');
const tickerBoard = require('./tikerBoard');

const app = express();

const { COIN_API, BOT_TOKEN, PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


const client = new CoinMarketCap(COIN_API);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const start = async (msg, id) => { //Функция для приветствия нового пользователя
  const message = `
  Добро пожаловать ${msg.from.first_name}!
Здесь ты можешь узнать актуальную информацию о любой криптовалюте всего в пару кликов :-)

  <strong>Выбери нужную валюту для конвертации</strong>
    `;

  await bot.sendMessage(id, message, {
    parse_mode: 'HTML',
    ...currencyBoard,
  });
};

const currencySelect = async (id) => { //Выбор фитаной валюты
  const message = `
<strong>Выбери нужную валюту для конвертации</strong>
`;
  await bot.sendMessage(id, message, {
    parse_mode: 'HTML',
    ...currencyBoard,
  });
};

const tickerSelect = async (id, curren) => { //Выбор криптовалюты
  const message = `
Вы выбрали валюту <strong>${curren}</strong>
Теперь выберите один из представленных тикеров или введите вручную тикер желаемой валюты, например BTC.

Со списком всех тикеров ты можешь ознакомиться в разделе /help
  `;
  await bot.sendMessage(id, message, {
    parse_mode: 'HTML',
    ...tickerBoard,
  });
};


//глобальная переменная, для хранения выбранной валюты или иной информации пользователя
const user = {};

bot.onText(/.+/g, async (msg, match) => {
  const { chat, text } = msg;

  try {
    if (text === '/start') { //Если введенное сообщение '/start', то выводим приветственное сообщение
      start(msg, chat.id);
    } else if (text === 'USD' || text === 'EUR' || text === 'RUB') {
      user[chat.id] = text;
      tickerSelect(chat.id, user[chat.id]);
    } else if (text === '/currency') {
      currencySelect(chat.id);
    } else {
      const selectCurrency = user[chat.id];

      if (selectCurrency) {
        // Условие для проверки, есть ли у пользователя выбранная валюта

        const tickerName = text.toUpperCase();
        const tikers = await client.getQuotes({
          symbol: tickerName,
          convert: selectCurrency,
        });

        // Через деструктуризацию получаем переменные из объекта полученного от API
        const { circulating_supply } = tikers.data[tickerName];

        // Через деструктуризацию получаем переменные из объекта полученного от API
        const {
          price,
          market_cap,
          volume_24h,
          percent_change_24h,
        } = tikers.data[tickerName].quote[selectCurrency];

        //Функция toCurrency преобразует числа в привычный денежный формат, затем replace убирает точку и числа после неё
        const tickerPrice = toCurrency(price, selectCurrency);
        const marketCap = (toCurrency(market_cap, selectCurrency)).replace(/\.[\S]*/g, '').trim();
        const volume24h = (toCurrency(volume_24h, selectCurrency)).replace(/\.[\S]*/g, '').trim();
        //Функция toNum преобразует числа в читаемый формат, затем replace убирает точку и числа после неё
        const circSupply = (toNum(circulating_supply)).replace(/\.[\S]*/g, '').trim();
        const percent = (percent_change_24h).toFixed(2);

        const tickersInfo = `
        <strong>${tikers.data[tickerName].name}</strong>
  <pre>
  Стоимость:  ${tickerPrice}
  Капитализация:  ${marketCap}
  Объём торгов за 24 часа:  ${volume24h}
  Изменение цены за 24 часа:  ${percent}%
  Выпущено токенов:  ${circSupply}
  </pre>
  
  <i>Информация предоставлена <a href="https://coinmarketcap.com/">CoinMarketCap</a></i>
      `;

        await bot.sendMessage(chat.id, tickersInfo, {
          parse_mode: 'HTML',
          ...tickerBoard,
          disable_web_page_preview: false,
        });
      } else {
        // Если валюта не выбрана, то предлагаем пользователю сделать выбор
        currencySelect(chat.id);
      }
    }
  } catch (e) {
    const errorMessage = `
К сожалению, такой тикер не найден. Попробуйте другое название, например  <strong>BTC</strong> 

Или воспользуйтесь командой /help
`;
    bot.sendMessage(chat.id, errorMessage, {
      parse_mode: 'HTML',
    });
    // eslint-disable-next-line no-console
    console.error(e);
  }
});
