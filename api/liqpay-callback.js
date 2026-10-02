import crypto from 'node:crypto';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).send('Method not allowed');
  try{
    const {data,signature}=req.body||{};
    const privateKey=process.env.LIQPAY_PRIVATE_KEY;
    if(!privateKey||!data||!signature) return res.status(400).send('Invalid callback');
    const expected=crypto.createHash('sha3-256').update(privateKey+data+privateKey).digest('base64');
    if(expected!==signature) return res.status(403).send('Invalid signature');
    const payload=JSON.parse(Buffer.from(data,'base64').toString('utf8'));
    console.log('LiqPay callback:',JSON.stringify({order_id:payload.order_id,status:payload.status,amount:payload.amount}));
    return res.status(200).send('OK');
  }catch(e){return res.status(400).send('Bad callback');}
}