import moment from "moment";

import {
  WEEKDAYS,
  DISPLAY_FORMAT,
  ISO_FORMAT,
  ISO_MONTH_FORMAT
} from "./constants";

export function contains(arr, elm) {
  return arr.indexOf(elm) !== -1;
}

export function getCalendarMonthWeeks(
  month,
  enableOutsideDays,
  firstDayOfWeek
) {
  if (!moment.isMoment(month) || !month.isValid()) {
    throw new TypeError("`month` must be a valid moment object");
  }
  if (!contains(WEEKDAYS, firstDayOfWeek)) {
    throw new TypeError("`firstDayOfWeek` must be an integer between 0 and 6");
  }

  // Set utc offset to get correct dates in future (when timezone changes)
  const firstOfMonth = month
    .clone()
    .startOf("month")
    .hour(12);
  const lastOfMonth = month
    .clone()
    .endOf("month")
    .hour(12);

  // Calculate the exact first and last days to fill the entire matrix
  // (considering days outside month)
  const prevDays = (firstOfMonth.day() - firstDayOfWeek) % 7;
  const nextDays = (firstDayOfWeek + 6 - lastOfMonth.day()) % 7;
  const firstDay = firstOfMonth.clone().subtract(prevDays, "day");
  const lastDay = lastOfMonth.clone().add(nextDays, "day");

  const totalDays = lastDay.diff(firstDay, "days") + 1;

  const currentDay = firstDay.clone();
  const weeksInMonth = [];

  for (let i = 0; i < totalDays; i++) {
    if (i % 7 === 0) {
      weeksInMonth.push([]);
    }

    let day = null;
    if ((i >= prevDays && i < totalDays - nextDays) || enableOutsideDays) {
      day = currentDay.clone();
    }

    weeksInMonth[weeksInMonth.length - 1].push(day);

    currentDay.add(1, "day");
  }

  return weeksInMonth;
}

export function isSameDay(a, b) {
  if (!moment.isMoment(a) || !moment.isMoment(b)) {
    return false;
  }
  // Compare least significant, most likely to change units first
  // Moment's isSame clones moment inputs and is a tad slow
  return (
    a.date() === b.date() && a.month() === b.month() && a.year() === b.year()
  );
}

export function toMomentObject(dateString, customeFormat) {
  const dateFormats = customeFormat
    ? [customeFormat, DISPLAY_FORMAT, ISO_FORMAT]
    : [DISPLAY_FORMAT, ISO_FORMAT];

  const date = moment(dateString, dateFormats, true);

  return date.isValid() ? date.hour(12) : null;
}

export function toISODateString(date, currentFormat) {
  const dateObj = moment.isMoment(date)
    ? date
    : toMomentObject(date, currentFormat);
  if (!dateObj) {
    return "";
  }

  return dateObj.format(ISO_FORMAT);
}

export function getMonths(
  initialMonth,
  numberOfMonths,
  withoutTransitionMonths
) {
  let month = initialMonth.clone();
  if (!withoutTransitionMonths) {
    month = month.subtract(1, "month");
  }

  const months = [];
  for (
    let i = 0;
    i < (withoutTransitionMonths ? numberOfMonths : numberOfMonths + 2);
    i++
  ) {
    months.push(month);
    month = month.clone().add(1, "month");
  }

  return months;
}

const CALENDAR_MONTH_PADDING = 9;

export function getCalendarMonthWidth(daySize) {
  return 7 * (daySize + 1) + 2 * (CALENDAR_MONTH_PADDING + 1);
}

export function getTransformStyles(transformValue) {
  return {
    transform: transformValue,
    msTransform: transformValue,
    MozTransform: transformValue,
    WebkitTransform: transformValue
  };
}

export function toISOMonthString(date, currentFormat) {
  const dateObj = moment.isMoment(date)
    ? date
    : toMomentObject(date, currentFormat);
  if (!dateObj) {
    return "";
  }

  return dateObj.format(ISO_MONTH_FORMAT);
}

/**
 * @param {HTMLElement} el
 * @param {string} axis
 * @param {boolean} borderBox
 * @param {boolean} withMargin
 */
export function calculateDimension(
  el,
  axis,
  borderBox = false,
  withMargin = false
) {
  if (!el) {
    return 0;
  }

  const axisStart = axis === "width" ? "Left" : "Top";
  const axisEnd = axis === "width" ? "Right" : "Bottom";

  // Only read styles if we need to
  const style = !borderBox || withMargin ? window.getComputedStyle(el) : null;

  // Offset includes border and padding
  const { offsetWidth, offsetHeight } = el;
  let size = axis === "width" ? offsetWidth : offsetHeight;

  // Get the inner size
  if (!borderBox) {
    size -=
      parseFloat(style[`padding${axisStart}`]) +
      parseFloat(style[`padding${axisEnd}`]) +
      parseFloat(style[`border${axisStart}Width`]) +
      parseFloat(style[`border${axisEnd}Width`]);
  }

  // Apply margin
  if (withMargin) {
    size +=
      parseFloat(style[`margin${axisStart}`]) +
      parseFloat(style[`margin${axisEnd}`]);
  }

  return size;
}

export function isTransitionEndSupported() {
  return Boolean(typeof window !== "undefined" && "TransitionEvent" in window);
}