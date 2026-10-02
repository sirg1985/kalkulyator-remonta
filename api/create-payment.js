export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const { worker, workerCity, workerCategory, client, phone, service, amount, currency='UAH' } = req.body || {};
    const sum = Number(amount);
    if (!worker || !client || !phone || !service || !Number.isFinite(sum) || sum <= 0) {
      return res.status(400).json({error:'Некорректные данные заказа'});
    }
    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!publicKey || !privateKey) return res.status(500).json({error:'LiqPay keys are not configured'});
    const orderId = 'HIRE-' + Date.now() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const payload = {
      public_key: publicKey,
      version: '3',
      action: 'pay',
      amount: sum.toFixed(2),
      currency,
      description: 'Найм работника: ' + service,
      order_id: orderId,
      result_url: process.env.LIQPAY_RESULT_URL || 'https://sirg1985.github.io/kalkulyator-remonta/',
      server_url: process.env.LIQPAY_SERVER_URL || ''
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = cryptoSign(privateKey, data);
    return res.status(200).json({url:'https://www.liqpay.ua/api/3/checkout', method:'POST', data, signature, order_id:orderId});
  } catch (e) {
    return res.status(500).json({error:'Ошибка создания платежа'});
  }
}
function cryptoSign(privateKey, data) {
  const crypto = require('crypto');
  return crypto.createHash('sha3-256').update(privateKey + data + privateKey).digest('base64');
}