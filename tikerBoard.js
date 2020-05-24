const tickerBoard = {
  reply_markup: {
    keyboard: [
      ['BTC', 'ETH', 'LTC'],
      ['BCH', 'BSV', 'LTC'],
      ['BNB', 'EOS', 'XMR'],
    ],
    one_time_keyboard: true,
  },
};

module.exports = tickerBoard;
