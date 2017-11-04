loadMoment();
let HOUR_IN_A_DAY = 8;
let MINIMUM_HOUR_INTERVAL = 4;

let _oldAddWeekDays = momentBusiness.addWeekDays;
momentBusiness.addWeekDays = function(moment, daysToAdd, holidays) {
  return _oldAddWeekDays.call(momentBusiness, moment, daysToAdd);
}

momentBusiness.addWeekDayHours = function(moment, hoursToAdd, holidays) {
  if (hoursToAdd > HOUR_IN_A_DAY) {
    throw new Error('hoursToAdd in addWeekDayHours cannot be greater than HOUR_IN_A_DAY');
  }
  moment.add(hoursToAdd, 'hours');
  let hoursSince = _hoursPassed(moment);
  let overlappingHours = hoursSince - HOUR_IN_A_DAY
  if (overlappingHours > 0) {
    // console.log('adding overlapping hours', overlappingHours);
    momentBusiness.addWeekDays(moment, 1, holidays);
    moment.startOf('day');
    momentBusiness.addWeekDayHours(moment, overlappingHours, holidays);
  }
  if (_hoursPassed(moment) == HOUR_IN_A_DAY) {
    moment.startOf('day');
    momentBusiness.addWeekDays(moment, 1, holidays);
  }
}

function GetStartDates(startDate, taskDurations, holidays) {
  let latestDate = __toMoment(startDate);
  return taskDurations.map((taskDuration) => {
    let {
      days,
      total,
      dayHourRemainder
    } = __parseTaskDuration(taskDuration);
    // console.log(`task takes total of ${total} hour/s.`);
    // console.log(`adding ${days} days. and ${dayHourRemainder} hours`);
    momentBusiness.addWeekDays(latestDate, days, holidays);
    momentBusiness.addWeekDayHours(latestDate, dayHourRemainder, holidays);
    let hoursSince = _hoursPassed(latestDate);
    return [`${latestDate.format('MM/DD/YYYY')}`];
  });
}

function GetChartHeader() {

}

function GetChart() {

}

function _hoursPassed(moment) {
  let startOfDayMoment = moment.clone().startOf('day');
  return moment.diff(startOfDayMoment, 'hours');
}

function __toMoment(toMoment) {
  var retVal = moment(toMoment, 'MM/DD/YYYY', true);
  retVal.startOf('day');
  return retVal;
}

/**
 * a taskDuration should be in the format of [hr, offset]
 * where hr and offset are integers and should be both divisible by MINIMUM_HOUR_INTERVAL
 * @param {*} taskDuration 
 */
function __parseTaskDuration(taskDuration) {
  let [duration, offset] = taskDuration.map((x) => x || 0);
  let total = duration + offset;
  let days = Math.floor(total / HOUR_IN_A_DAY);
  let dayHourRemainder = total % HOUR_IN_A_DAY;
  return {
    total,
    days,
    dayHourRemainder
  }
}

function loadMoment() {
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js').getContentText());
  eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/jmeas/moment-business/master/dist/moment-business.min.js').getContentText());
}