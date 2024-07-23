import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import { useCalendarState } from '../../stores/calendarState';
const ControlView = () => {
	const [ calendarState, setCalendarState ] = useCalendarState();
	const { mode, date } = calendarState;
	const [ curDateStr, setCurDateStr ] = useState('');

	useEffect(
		() => {
			let newCurDate;
			if (mode === 'monthly') {
				newCurDate = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월';
			} else if (mode === 'weekly') {
				let lastDate = parseInt((date.getDate() + (6 - date.getDay())) / 7) + 1;
				newCurDate = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + lastDate + '주';
			}
			else if (mode === 'daily') { // 추가된 부분: 일간 모드에 대한 날짜 문자열 설정
				newCurDate = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일';
			}
			setCurDateStr(newCurDate);
		},
		[ date, mode ]
	);

	const onClickLeft = () => {
		changeDate(-1);
	};

	const onClickRight = () => {
		changeDate(1);
	};

	const onClickDateView = () => {
		setCalendarState({ ...calendarState, date: new Date() });
	};

	const changeDate = (value) => {
		let newDate;
		if (mode === 'weekly') {
			newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + value * 7);
		} else if (mode === 'monthly') {
			newDate = new Date(date.getFullYear(), date.getMonth() + value, date.getDate());
		}
		else if (mode === 'daily') { // 추가된 부분: 일간 모드에서 날짜를 하루씩 변경
			newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + value);
		}
		setCalendarState({ ...calendarState, date: newDate });
	};

	const onClickModeController = (selectedMode) => {
		// const nextMode = mode === 'monthly' ? 'weekly' : mode === 'weekly' ? 'daily' : 'monthly'; 
		setCalendarState({ ...calendarState, mode: selectedMode });
	};

	return (
		<div id="control-view">
			<div id="week-controller">
				<div className="arrow-btn" onClick={onClickLeft}>
					<img src={require('../../../img/arrow-left.png')} />
				</div>
				<div id="date-view" onClick={onClickDateView}>
					{curDateStr}
				</div>
				<div className="arrow-btn" onClick={onClickRight}>
					<img src={require('../../../img/arrow-right.png')} />
				</div>
			</div>
			<div id="mode-controller">
				<div id="mode-btn" className={mode === 'monthly' ? 'active' : null} onClick={() => onClickModeController('monthly')}>
					월
				</div>
				<div id="mode-btn" className={mode === 'weekly' ? 'active' : null} onClick={() => onClickModeController('weekly')}>
					주
				</div>
				<div id="mode-btn" className={mode === 'daily' ? 'active' : null} onClick={() => onClickModeController('daily')}> {/* 추가된 부분: 일간 모드 버튼 */}
					일
				</div>
			</div>
		</div>
	);
};

export default ControlView;
