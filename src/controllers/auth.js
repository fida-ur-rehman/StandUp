const {userModel} = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")
const bcrypt = require("bcrypt")

const {validateEmail} = require("../config/function")
const {validatePhoneNumber} = require("../config/function")

let JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
let JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
let refreshTokens = [];

class Auth {

  async sendOTP(req, res) {
        let email = req.body.email;
        let otp = Math.floor(100000 + Math.random() * 900000);
        let ttl = 60 * 60 * 1000;
        let expires = Date.now() + ttl;
        let data = `${email}.${otp}.${expires}`;
        let hash = crypto.createHmac('sha256', process.env.SECRETKEY).update(data).digest('hex');
        let fullHash = `${hash}.${expires}`;

        console.log("OTP:" +""+otp)
        res.status(200).send({ email, hash: fullHash, otp });  // this bypass otp via api only for development instead hitting twilio api all the time
  };

  async verifyOTP(req, res){
    try {
      let {email, hash, otp} = req.body
      if(!email || !hash || !otp) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {

        let email = req.body.email;
        let hash = req.body.hash;
        let otp = req.body.otp;
        let [ hashValue, expires ] = hash.split('.');

        let now = Date.now();
        if (now > parseInt(expires)) {
          return res.status(504).send({ msg: 'Timeout. Please try again' });
        }
        let data = `${email}.${otp}.${expires}`;
        let newCalculatedHash = crypto.createHmac('sha256', process.env.SECRETKEY).update(data).digest('hex');

        if (newCalculatedHash === hashValue) {
          console.log('user confirmed');
          let user = await userModel.findOneAndUpdate({email}, {$set: {verified: true}}).select("name role roleType email company title organisations")
            if (user){
              let token = jwt.sign({ data: user }, JWT_REFRESH_TOKEN, { expiresIn: '1d' });
                  res.status(200).send({result: "Verified", token, msg: "Success"})
            } else {
              return res.status(201).send({ result: "Not Found", msg: 'Success' });
            }
        } else {
          console.log('not authenticated');
          return res.status(201).send({ result: "Incorrect", msg: 'Success' });
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  };

  async verifyPin(req, res) {
    try {
      let {email, pin} = req.body;
      if(!email || !pin){
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        userModel.findOne({email})
        .then((user) => {
          if(user.verified === false){
            return res.status(201).json({ result: "Email Not Verified", msg: "Error"});
          } else if (user.pin === null) {
            return res.status(201).json({ result: "Pin Setup Remaining", msg: "Error"});
          } else {
            let newPin = pin.toString();
            bcrypt.compare(newPin, user.pin, function(err, result) {
              if(result == true) {
                let refreshToken = jwt.sign({ data: email }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
                return res.status(200).json({ result: refreshToken, msg: "Success"});
              } else {
                return res.status(201).json({ result: "Incorrect", msg: "Error"});
              }
          });
          }
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  };

  async verifyPassword(req, res) {
    try {
      let {email, password} = req.body;
      if(!email || !password){
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        userModel.findOne({email})
        .then((user) => {
          if(user.verified === false){
            return res.status(201).json({ result: "Email Not Verified", msg: "Error"});
          } else if (user.Password === null) {
            return res.status(201).json({ result: "Password Setup Remaining", msg: "Error"});
          } else {
            let newPassword = password.toString();
            bcrypt.compare(newPassword, user.password, function(err, result) {
              if(result == true) {
                let refreshToken = jwt.sign({ data: email }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
                return res.status(200).json({ result: refreshToken, msg: "Success"});
              } else {
                return res.status(201).json({ result: "Incorrect", msg: "Error"});
              }
          });
          }
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  };

}

const authController = new Auth();
module.exports = authController;
// async verifyOTP(req, res){
//   try {
//     let {email, hash, otp} = req.body
//     if(!email || !hash || !otp) {
//       return res.status(201).json({ result: "Data Missing", msg: "Error"});
//     } else {

//       let email = req.body.email;
//       let hash = req.body.hash;
//       let otp = req.body.otp;
//       let [ hashValue, expires ] = hash.split('.');

//       let now = Date.now();
//       if (now > parseInt(expires)) {
//         return res.status(504).send({ msg: 'Timeout. Please try again' });
//       }
//       let data = `${email}.${otp}.${expires}`;
//       let newCalculatedHash = crypto.createHmac('sha256', process.env.SECRETKEY).update(data).digest('hex');
//       let accessToken = jwt.sign({ data: email }, JWT_AUTH_TOKEN, { expiresIn: '60s' });
//       let refreshToken = jwt.sign({ data: email }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
//       console.log(newCalculatedHash)
//       console.log(hashValue)
//       if (newCalculatedHash === hashValue) {
//         console.log('user confirmed');

//         let user = await userModel.findOne({email: email})
//         console.log(user)
//           if (user){
//                 refreshTokens.push(refreshToken);
//                 res
//                   .status(202)
//                   .cookie('accessToken', accessToken, {
//                     expires: new Date(new Date().getTime() + 30 * 1000),
//                     sameSite: 'strict',
//                     httpOnly: true
//                   })
//                   .cookie('refreshToken', refreshToken, {
//                     expires: new Date(new Date().getTime() + 31557600000),
//                     sameSite: 'strict',
//                     httpOnly: true
//                   })
//                   .cookie('authSession', true, {
//                     expires: new Date(new Date().getTime() + 30 * 1000),
//                     sameSite: 'strict'
//                   })
//                   .cookie('refreshTokenID', true, {
//                     expires: new Date(new Date().getTime() + 31557600000),
//                     sameSite: 'strict'
//                   })
//                 // res.status(200)
//                 .send({result: refreshToken, msg: "signup"})
//           } else {
//             console.log("User Already Exist, Logging in...")
//             return res.status(201).send({ result: "Not Found", msg: 'Success' });
//           }
//       } else {
//         console.log('not authenticated');
//         return res.status(201).send({ result: "Incorrect", msg: 'Success' });
//       }
//     }
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({ result: err, msg: "Error"});
//   }
// };