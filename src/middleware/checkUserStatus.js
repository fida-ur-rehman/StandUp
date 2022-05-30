const { RRule } = require('rrule')
const moment = require('moment');
const { promise } = require('bcrypt/promises');

module.exports.checkUserStatus = (standup) => {


        let currentDate1 = new Date()
        let currentDate = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 00))

        let users = standup.lastSubmittedBy.map( (user) => {
        let rule = new RRule(standup.occurrence);

        let createdAt1 = user.date
        let createdAt = new Date(Date.UTC(createdAt1.getUTCFullYear(), createdAt1.getUTCMonth(), createdAt1.getUTCDate(), 00))

        let previousOccurrence = rule.before(currentDate, true);
        let previousOccurrenceUTC = moment(previousOccurrence).utc();

        let afterOccurrence = rule.after(currentDate, true);
        let afterOccurrenceUTC = moment(afterOccurrence).utc();

        let previous = moment(createdAt).isSameOrBefore(afterOccurrenceUTC, 'day')
        let after = moment(createdAt).isSameOrAfter(previousOccurrenceUTC, 'day')

        if(previous && after){
            let newUser = {
                _id: user._id,
                userId: user.userId,
                date: user.date,
                status: true
            }
              return newUser
           
        } else {
            let newUser = {
                _id: user._id,
                userId: user.userId,
                date: user.date,
                status: false
            }
              return newUser
        }
       })
    
Object.assign(standup.lastSubmittedBy, users)
return {standup, users}
};