import crypto from 'node:crypto';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const {email='',phone=''}=req.body||{};
    const publicKey=process.env.LIQPAY_PUBLIC_KEY;
    const privateKey=process.env.LIQPAY_PRIVATE_KEY;
    if(!publicKey||!privateKey) return res.status(500).json({error:'LiqPay keys are not configured'});
    const orderId='PRO-'+Date.now()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
    const start=new Date(Date.now()+60*1000);
    const pad=n=>String(n).padStart(2,'0');
    const subscribeDate=start.getUTCFullYear()+'-'+pad(start.getUTCMonth()+1)+'-'+pad(start.getUTCDate())+' '+pad(start.getUTCHours())+':'+pad(start.getUTCMinutes())+':00';
    const payload={
      public_key:publicKey,
      version:'7',
      action:'subscribe',
      amount:'199',
      currency:'UAH',
      description:'Калькулятор ремонта PRO — 1 месяц',
      order_id:orderId,
      subscribe:'1',
      subscribe_date_start:subscribeDate,
      subscribe_periodicity:'month',
      result_url:process.env.LIQPAY_PRO_RESULT_URL||'https://sirg1985.github.io/kalkulyator-remonta/pro.html',
      server_url:process.env.LIQPAY_PRO_SERVER_URL||''
    };
    if(email) payload.sender_email=email;
    if(phone) payload.phone=phone.replace(/\D/g,'');
    const data=Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature=crypto.createHash('sha3-256').update(privateKey+data+privateKey).digest('base64');
    return res.status(200).json({url:'https://www.liqpay.ua/api/3/checkout',method:'POST',data,signature,order_id:orderId});
  }catch(e){return res.status(500).json({error:'Ошибка создания PRO-платежа'});}
}