const aws = require('aws-sdk')
aws.config.loadFromPath('./config/config.json')
const sns = new aws.SNS({ apiVersion: '2010-03-31'})

exports.handler = function(event, context, callback) {
   console.log("AWS lambda and SNS trigger ");
   console.log(event);

   const snsmessage = 'PRESENÇA DETECTADA NO AMBIENTE CONFIGURADO!';
   const fone = '';
   
   console.log(snsmessage);
   sns.publish({
      Message: snsmessage,
      PhoneNumber: fone
   }, function (err, data) {
      if (err) {
         console.log(err);
         callback(err, null);
      } else {
        console.log(data);
        callback(null, JSON.stringify(data));
      }
   });
};