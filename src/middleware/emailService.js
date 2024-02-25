const aws = require("aws-sdk");
require("dotenv").config()

// const params1 =  require("./otp.email.json");

const ses = new aws.SES({    
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
})

module.exports.sesOTP =  function(emailTo, emailFrom, otp, name, data) {  
  var params = {
    Destination: {
        ToAddresses: [emailTo]
    },
    Message: {
        Body: {
            Text: {
                Data: `Hello ${emailTo},\n\nYour SynxUp One Time Password (OTP) is \n\n${otp}\n\nDo not share it with anyone for security reasons\n\nTeam,\nSynxUp`
            },
        },
        Subject: {
            Data: "SynxUp - Login Otp"
        }
    },
    Source: emailFrom
    };
    return ses.sendEmail(params).promise();
  }

  module.exports.addedToStandup =  function(emailTo, emailFrom, standupName, orgName) {  
    var params = {
      Destination: {
          ToAddresses: [emailTo]
      },
      Message: {
          Body: {
              Text: {
                  Data: `Hello ${emailTo},\n\nYou have been Added to an standup \n\n${standupName}\nby: ${orgName}\n\n you can visit https://synxup.com/standup to view your standUps \n\nTeam,\nSynxUp`
              },
          },
          Subject: {
              Data: "SynxUp - Login Otp"
          }
      },
      Source: emailFrom
      };
      return ses.sendEmail(params).promise();
    }