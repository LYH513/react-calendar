import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import WeeklyCell from './WeeklyCell';
import { getSchedule } from '../components/UserDataController';
// store
import { useCalendarState } from '../../stores/calendarState';
import { useUserData } from '../../stores/userData';

//15분 간격 배열 추가
export const times = [
	'00:00', '00:15', '00:30', '00:45',
	'01:00', '01:15', '01:30', '01:45',
	'02:00', '02:15', '02:30', '02:45',
	'03:00', '03:15', '03:30', '03:45',
	'04:00', '04:15', '04:30', '04:45',
	'05:00', '05:15', '05:30', '05:45',
	'06:00', '06:15', '06:30', '06:45',
	'07:00', '07:15', '07:30', '07:45',
	'08:00', '08:15', '08:30', '08:45',
	'09:00', '09:15', '09:30', '09:45',
	'10:00', '10:15', '10:30', '10:45',
	'11:00', '11:15', '11:30', '11:45',
	'12:00', '12:15', '12:30', '12:45',
	'13:00', '13:15', '13:30', '13:45',
	'14:00', '14:15', '14:30', '14:45',
	'15:00', '15:15', '15:30', '15:45',
	'16:00', '16:15', '16:30', '16:45',
	'17:00', '17:15', '17:30', '17:45',
	'18:00', '18:15', '18:30', '18:45',
	'19:00', '19:15', '19:30', '19:45',
	'20:00', '20:15', '20:30', '20:45',
	'21:00', '21:15', '21:30', '21:45',
	'22:00', '22:15', '22:30', '22:45',
	'23:00', '23:15', '23:30', '23:45'
]

const Weekly = () => {
	const [ calendarState, setCalendarState ] = useCalendarState();
	const { date } = calendarState;

	const [ dates, setDates ] = useState([]);
	const [timeTable, setTimeTable] = useState(['', '', ...times]); 

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
			console.log('주간 일정',curSchedule );
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
		const tempTime = times;  //15분 간격 배열 추가
		
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

		// HH:MM string 형식 분할 후 number 타입 변환
		const [propsHour, propsMin] = (typeof startHour === 'string' ? startHour.split(':') : ['0', '0']).map(Number);

    // 분값을 15분 단위로 구간 나누어 변환하는 함수
    const to15MinRange = (minutes) => {
			if (minutes < 15) return 0;
			if (minutes < 30) return 15;
			if (minutes < 45) return 30;
			return 45;
	};

		for (let i = 0; i < curSchedule.length; i++) {

			if (curDate.getTime() === curSchedule[i].curDate.getTime() && curSchedule[i].startTime.hour === propsHour && to15MinRange(curSchedule[i].startTime.minute) === propsMin ) {
				curDateSchedule = curSchedule[i];
				break;
			}
		}

		// console.log('cur',curDateSchedule );
		
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
