import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import Monthly from './Monthly';
import Weekly from './Weekly';
// store
import { useCalendarState } from '../../stores/calendarState';
import Daily from './Daily';
const CalendarView = () => {
	const [ calendarState, setCalendarState ] = useCalendarState();
	const { mode } = calendarState;

	return (
		<div id="calendar-view">
			{mode === 'monthly' ? (
				<Monthly /> // 월간 보기 렌더링
			) : mode === 'weekly' ? (
				<Weekly /> // 주간 보기 렌더링
			) : mode === 'daily' ? (
				<Daily /> // 일간 보기 렌더링
			) : null}
		</div>
	);

};

export default CalendarView;
