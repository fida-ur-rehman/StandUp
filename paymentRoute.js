const express = require("express")
const PaytmChecksum = require("./PaytmChecksum")
require("dotenv").config()
const {v4:uuidv4} = require("uuid")
const router = express.Router()
const formidable=require("formidable")
const User = require("../models/user");
const date = require('date-and-time');
const nodemailer = require("nodemailer")
const Product = require("../models/product");

var fs = require('fs');



router.post("/callback",(req,res)=>{
    const form = new formidable.IncomingForm()
    form.parse(req,async (err,fields,file)=>{
      console.log(fields)
if(err){
    console.log(err)
}
paytmChecksum = fields.CHECKSUMHASH;
delete fields.CHECKSUMHASH;
//merchant id kupXTo83613795537613
//merchant key KcD6HXTx4gx%r4hl
//test key KcD6HXTx4gx%r4hl
var isVerifySignature = PaytmChecksum.verifySignature(fields,"&KFtiFfi681&77if" , paytmChecksum);
if (isVerifySignature) {
  console.log(fields)
  if(fields.STATUS==='TXN_SUCCESS'){
    let useremail = req.query.email
    let person = await User.findOne({email: req.query.email});
    let userName = person.name;
    // find product name here

    let productInfo = await Product.findOne({_id: person.plan})
    console.log(productInfo);

    let productName = productInfo.name;
    let orderNo = person.referralId;
    const now = new Date();
    let paymentstamp = date.format(now, 'DD/MM/YYYY HH:mm:ss');  
    let price = fields.TXNAMOUNT +" "+ fields.CURRENCY
    let taxes = "18%"
    let totalAmount = fields.TXNAMOUNT

  const save = await User.updateOne({email: useremail}, {$push: {transactiondetails: fields}});

     let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'earnwithfriendofficial@gmail.com',
        pass: "#EManitr!120146"
      }
    });
    
    var newMail = {
      from: 'earnwithfriendofficial@gmail.com',
      to: useremail,
      subject: "Earnwithfriends Order Confirmation",
      text: "payment Done",
      html: `<html lang="en"><head> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Document</title></head><body> <!-- Congratulations, you got a new sale of Earnwithfriend Gold-X. --> <div class="content"> <p>Hey ${userName}, </p> <p>Greetings from Earnwithfriend!!</p> <p>We thank you for Purchasing Earnwithfriend Gold-X. <br> Please find your login details below… </p> <p>User name : ${useremail}<br> Forget Password : https://shrouded-chamber-98641.herokuapp.com/forgotpassword <br> </p> <p>Your Order Details are given below…</p> <p> Order No : ${orderNo}<br> Date :${paymentstamp} <br> Product : ${productName} <Br> Price (USD.) : ${price} <br> Taxes.(USD.) : ${taxes} <br> Total Amount Paid (USD.) : ${totalAmount} </p> <p>Thank you once again and welcome you to our Earnwithfriend Family. For any further query, please raise ticket to the Support Team by sending an email to earnwithfriendofficial@gmail.com </p> <p>Thanks, and Happy Learning</p> <p>Team Earnwithfriend.</p><img src="cid:efs"> </div></body>`,
    };
    
    transport.sendMail(newMail, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
     
         
       let {friendsReferralId,_id} = await User.findOne({email:useremail});
       console.log(friendsReferralId,_id)
         let refid =_id //id of email wala user jo signup karra
       
         let pushreferredlist = await User.updateOne({referralId:friendsReferralId},{$push:{referredList:{refid}}})
         //maine tumku refer kara wo fix hogaya
         let user = await User.findOne({referralId:friendsReferralId})
         //friends ki referral id pe kaam karneka
         console.log(user.referredList.length)
         console.log(user.referredList.length%5)

         let signupUser = await User.findOne({email: useremail});

         let usersPlan = await Product.findOne({_id:user.plan}) //serach for the friends plan  so we can increment his wallet according to his plan


        //  if(user.referredList.length%5 ===0 && user.referredList.length!==0){
        //    // for every 5 members we are doing the ocde boelwooihlkwert
        // if(productName==="Bronze"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Bronze.activeIncome+usersPlan.sales.Bronze.passiveIncome}}) // if the user brings a bronze customer then increment his income by hisplan.bronze //silver/gild
        //   let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Bronze.passiveIncome}})
        // }else if(productName==="Silver"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Silver.activeIncome+usersPlan.sales.Silver.passiveIncome}}) 
        //  let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Silver.passiveIncome}})
        // }
        // else if(productName==="Gold"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Gold.activeIncome+usersPlan.sales.Gold.passiveIncome}}) 
        //  let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Gold.passiveIncome}})
        // }else if(productName==="Platinum"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Platinum.activeIncome+usersPlan.sales.Platinum.passiveIncome}}) 
        //  let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Platinum.passiveIncome}})
        // }
        // else if(productName==="Diamond"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Diamond.activeIncome+usersPlan.sales.Diamond.passiveIncome}}) 
        //   let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Diamond.passiveIncome}})
        // }else if(productName==="Sapphire"){
        //   let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Sapphire.activeIncome+usersPlan.sales.Sapphire.passiveIncome}}) 
        //   let commission = await User.updateOne({referralId:friendsReferralId},{$inc:{commission:usersPlan.sales.Sapphire.passiveIncome}})
        // }
         
        //  //let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:6.69}})
        //  let commissionMail = nodemailer.createTransport({
        //    service: 'gmail',
        //    auth: {
        //      user: 'earnwithfriendofficial@gmail.com',
        //      pass: "#EManitr!120146"
        //    }
        //  });

        //  var mailOptions = { 
        //    from: 'earnwithfriendofficial@gmail.com',
        //    to: user.email,
        //    subject: "Congratulations, You got a new sale of Earnwithfriend Gold-X",
        //    text: "Congratulations",
        //    html: `<html lang="en"><head> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Document</title></head><body> <!-- Congratulations, you got a new sale of Earnwithfriend Gold-X. --> <div class="content"> <p>Hey ${user.name}, </p> <p>Greetings from Earnwithfriend!!</p> <p>Congratulations you have a got a new sale of Earnwithfriend Gold-X. Please find details below…</p> <p>Customer Name : ${signupUser.name} <br> Customer Affiliate Id : ${signupUser.referralId} <br> Customer Email Address : ${signupUser.email} <br> Product : Earnwithfriend Gold-X <br> Affiliate Commission Amount (USD) : ${"$"+6.69} <br> Affiliate Bonus Amount : ${"$"+6.69} </p> <p style="font-weight: bold;">Please note, this commission will be added to your Affiliate account and will be paid to your Bank in the upcoming Pay-Out Cycle.</p> <p>For any further query, please raise ticket to the Support Team by sending an email to earnwithfriendofficial@gmail.com</p> <p>Thanks, and Happy Learning</p> <p>Team Earnwithfriend.</p> </div></body></html>`
        //  };
        //  commissionMail.sendMail(mailOptions, (error, info) => {
        //    if (error) {
             
        //      return console.log(error);
        //    }
        //    console.log('Message sent: %s', info.messageId);
        //  });
       
       
        //  }
         //else{
           //bonus email here

           let bonusEmail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'earnwithfriendofficial@gmail.com',
              pass: "#EManitr!120146"
            }
          });

          var mailOptions = { 
            from: 'earnwithfriendofficial@gmail.com',
            to: user.email,
            subject: "Congratulations, You got a new sale of Earnwithfriend Gold-X",
            text: "Congratulations",
            html: `<html lang="en"><head> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Document</title></head><body> <!-- Congratulations, you got a new sale of Earnwithfriend Gold-X. --> <div class="content"> <p>Hey ${user.name}, </p> <p>Greetings from Earnwithfriend!!</p> <p>Congratulations you have a got a new sale of Earnwithfriend Gold-X. Please find details below…</p> <p>Customer Name : ${signupUser.name} <br> Customer Affiliate Id : ${signupUser.referralId} <br> Customer Email Address : ${signupUser.email} <br> Product : Earnwithfriend Gold-X <br> Affiliate Commission Amount (USD) : ${"$"+6.69} </p> <p style="font-weight: bold;">Please note, this commission will be added to your Affiliate account and will be paid to your Bank in the upcoming Pay-Out Cycle.</p> <p>For any further query, please raise ticket to the Support Team by sending an email to earnwithfriendofficial@gmail.com</p> <p>Thanks, and Happy Learning</p> <p>Team Earnwithfriend.</p> </div></body></html>`
          };
          bonusEmail.sendMail(mailOptions, (error, info) => {
            if (error) {
              
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
          });
          //increment bonus by friends plan the plan his friend has bought ...according to that
             if(productName==="Bronze"){
              //acitve income for second guy
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Bronze.activeIncome}}) // if the user brings a bronze customer then increment his income by hisplan.bronze //silver/gild
              let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Bronze.activeIncome}})
              //passive income for first guy

            }else if(productName==="Gold"){
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Gold.activeIncome}}) 
             let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Gold.activeIncome}})
            }else if(productName==="Diamond"){
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Diamond.activeIncome}}) 
              let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Diamond.activeIncome}})
            }else if(productName==="Silver"){
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Silver.activeIncome}}) 
              let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Silver.activeIncome}})
            }else if(productName==="Platinum"){
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Platinum.activeIncome}}) 
              let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Platinum.activeIncome}})
            }
            else if(productName==="Sapphire"){
              let wallet = await User.updateOne({referralId:friendsReferralId},{$inc:{wallet:usersPlan.sales.Sapphire.activeIncome}}) 
              let bonus = await User.updateOne({referralId:friendsReferralId},{$inc:{bonus:usersPlan.sales.Sapphire.activeIncome}})
            }

            //SECOND GUY SECTION ENDED----------------------------------------------------------------------------------------------------------------

            //increment passive income of 1st guy by seeing his plan
            let secondGuy = await User.findOne({referralId:friendsReferralId}) //find the second guy
            let firstGuy = await User.findOne({referralId:secondGuy.friendsReferralId}) //find the first guy
            //do the passive income increment
            let productInfoFirstGuy = await Product.findOne({_id: firstGuy.plan})
            let productNameFirstGuy = productInfoFirstGuy.name;
            if(productNameFirstGuy==="Bronze"){
              //acitve income for second guy
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Bronze.passiveIncome}}) // if the user brings a bronze customer then increment his income by hisplan.bronze //silver/gild
              let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Bronze.passiveIncome}})
              //passive income for first guy

            }else if(productNameFirstGuy==="Gold"){
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Gold.passiveIncome}}) 
             let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Gold.passiveIncome}})
            }else if(productNameFirstGuy==="Diamond"){
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Diamond.passiveIncome}}) 
              let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Diamond.passiveIncome}})
            }else if(productNameFirstGuy==="Silver"){
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Silver.passiveIncome}}) 
              let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Silver.passiveIncome}})
            }else if(productNameFirstGuy==="Platinum"){
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Platinum.passiveIncome}}) 
              let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Platinum.passiveIncome}})
            }
            else if(productNameFirstGuy==="Sapphire"){
              let wallet = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{wallet:usersPlan.sales.Sapphire.passiveIncome}}) 
              let bonus = await User.updateOne({referralId:secondGuy.friendsReferralId},{$inc:{commission:usersPlan.sales.Sapphire.passiveIncome}})
            }

         //}
      res.redirect("https://www.earnwithfriend.com/logintocontinue")
  }else {
    res.send("payment was unsuccessful please contact earnwithfriendofficial@gmail.com and explain the event in detail with the registered email don't try to signup because you will not be able to")
    }
	//push the payment json to transaction details
    
} 
    })
})

router.post("/payment",(req,res)=>{ //you get array buffer when you use wrong credentials
console.log(req.body.product)

var params = {};

/* initialize an array */
params['MID'] =`XWGwMl59443376078143`//"XWGwMl59443376078143"//process.env.PAYTM_MID;
params['WEBSITE'] = process.env.PAYTM_WEBSITE;
params['CHANNEL_ID'] = process.env.PAYTM_CHANNEL_ID;
params['INDUSTRY_TYPE_ID'] = 'Retail';
params['ORDER_ID'] = 'EWF_'  + new Date().getTime();
params['CUST_ID'] = `EWF_10${req.body.email.replace("@gmail.com","")}`;
params['TXN_AMOUNT'] = `${req.body.product.price}`;
params['CALLBACK_URL'] = `http://localhost:3002/api/callback?email=${req.body.email}`;
params['EMAIL'] = `${req.body.email}`;
params['MOBILE_NO'] = "";
//XWGwMl59443376078143
//&KFtiFfi681&77if
/**
 * https://securegw-stage.paytm.in/
* Generate checksum by parameters we have
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
*/
var paytmChecksum = PaytmChecksum.generateSignature(params,"&KFtiFfi681&77if" );//process.env.MERCHENT_KEY
paytmChecksum.then(function(checksum){
let paytmParams={
    ...params,
    "CHECKSUMHASH":checksum
}
res.json(paytmParams)
}).catch(function(error){
	console.log(error);
});


})

module.exports=router