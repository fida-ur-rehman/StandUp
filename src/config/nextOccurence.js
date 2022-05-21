
async function nextOccurrence(occurrence, start) { // (occurrence object, previous occurence date or start date)
    let currentDate = new Date();

    if(occurrence.repeatEvery.type === "day") {
        let every = occurrence.repeatEvery.number //${every} day
        let occurenceDate = start
        occurenceDate.setDate(start.getDate() + noDays)
        return occurenceDate;
    } else if (occurrence.repeatEvery.type === "week") {
        let every = occurrence.repeatEvery.number //${every} week
        let weekDays = occurrence.repeatEvery.week // Array Of week Days {Must be Sorted}
        let dayDates = []
        await weekDays.forEach(day => {
            let occurenceDate = start
            let startDay = occurrence.getDay();
            let distance = day - startDay;
            occurrence.setDate(occurrence.getDate() + distance)
            dayDates.push(occurrence)
            dayDates.sort((a, b) => b.date - a.date)
        });

        dayDates.forEach(occurenceDate => {
            if(currentDate <= occurenceDate) {
                return occurenceDate
            }
        })
    } else if (occurrence.repeatEvery.type === "month") {
        let every = occurrence.repeatEvery.number //${every} day
        let occurenceDate = start
        
        
    } else if (occurrence.repeatEvery.type === "year") {
        
    }

}