export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  // Здесь после подключения базы данных будет сохраняться подтверждённый статус заказа.
  // Важно: статус "оплачено" устанавливается только после проверки подписи LiqPay.
  return res.status(200).send('OK');
}