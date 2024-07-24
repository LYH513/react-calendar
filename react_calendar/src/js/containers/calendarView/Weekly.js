import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import WeeklyCell from './WeeklyCell';
import { getSchedule } from '../components/UserDataController';
// store
import { useCalendarState } from '../../stores/calendarState';
import { useUserData } from '../../stores/userData';
const Weekly = () => {
	const [ calendarState, setCalendarState ] = useCalendarState();
	const { date } = calendarState;

	const [ dates, setDates ] = useState([]);
	const [ timeTable, setTimeTable ] = useState([
		' ',
		' ',
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		23
	]);

	const [ userData, setUserData ] = useUserData();
	const { schedule } = userData;

	const [ curSchedule, setCurSchedule ] = useState([]);

	useEffect(
		() => {
			const { firstDate, lastDate } = getFirstAndLastDate();
			setDates(makeCalendar(firstDate, lastDate));
		},
		[ date ]
	);

	useEffect(
		() => {
			const { firstDate, lastDate } = getFirstAndLastDate();
			setCurSchedule(getSchedule(firstDate, lastDate, schedule));
		},
		[ userData ]
	);

	const getFirstAndLastDate = () => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDay();
		const firstDate = new Date(year, month, date.getDate() - day);
		const lastDate = new Date(year, month, date.getDate() + (6 - day));
		return { firstDate: firstDate, lastDate: lastDate };
	};

	const makeCalendar = (firstDate, lastDate) => {
		let tempDate = new Date(firstDate);
		const newDates = [ [ '일' ], [ '월' ], [ '화' ], [ '수' ], [ '목' ], [ '금' ], [ '토' ] ];
		const tempTime = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ];
		
		let index = 0;
		while (tempDate.getDate() !== lastDate.getDate()) {
			newDates[index].push(tempDate);
			newDates[index] = newDates[index].concat(tempTime);
			tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() + 1);
			index++;
		}
		newDates[index].push(tempDate);
		newDates[index] = newDates[index].concat(tempTime);
		setCurSchedule(getSchedule(firstDate, lastDate, schedule));
		return newDates.slice();
	};

	const getCurDateSchedule = (curDate, startHour) => {
		let curDateSchedule = null;

		for (let i = 0; i < curSchedule.length; i++) {
			console.log('주간 curSchedule',startHour);
			// console.log('주간 1',curDate);

			if (curDate.getTime() === curSchedule[i].curDate.getTime() && curSchedule[i].startTime.hour === startHour) {
				curDateSchedule = curSchedule[i];
				break;
			}
		}

		return curDateSchedule;
	};

	return (
		<div id="weekly-view">
			<div className="hour-col">
				{timeTable.map((a, i) => (
					<div key={i} className="hour-cell">
						{a}
					</div>
				))}
			</div>
			{console.log('주간 dates형식', dates)}
			{dates.map((a, i) => (
				<div key={i} className="weekly-col">
					{a.map((b, j) => (
						<WeeklyCell
							key={j}
							index={j}
							day={a[0]}
							date={a[1]}
							startHour={b}
							schedule={getCurDateSchedule(a[1], b)}
						/>
					))}
				</div>
			))}
		</div>
	);
};

export default Weekly;
