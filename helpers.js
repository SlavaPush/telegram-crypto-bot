const toCurrency = (price, curren = 'USD') => new Intl.NumberFormat('ru-RU', {
  currency: curren,
  style: 'currency',
  currencyDisplay: 'symbol',
}).format(price);

const toNum = (num) => new Intl.NumberFormat().format(num);


function debug(obj = {}) {
  return JSON.stringify(obj, null, 4);
}


module.exports = {
  toCurrency,
  toNum,
  debug,
};
