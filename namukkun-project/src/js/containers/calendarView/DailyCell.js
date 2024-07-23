import React, { useState } from 'react';
import '../../../sass/app.css';
import { editDate } from '../components/UserDataController';
// store
import { useErrorState } from '../../stores/errorState';
import { useAddFormState } from '../../stores/addFormState';
import { useUserData } from '../../stores/userData';
import { useDragAndDrop } from '../../stores/dragAndDrop';

const DailyCell = (props) => {
	const { index, day, date, startHour, schedule } = props;
	const [ addFormState, setAddFormState ] = useAddFormState();
	const { active } = addFormState;
	const [ errorState, setErrorState ] = useErrorState();
	const [ userData, setUserData ] = useUserData();
	const [ dragAndDrop, setDragAndDrop ] = useDragAndDrop();

	const height = schedule
		? {
				height: (schedule.endHour - schedule.startHour) * 50 - 22 + 'px'
			}
		: null;

	const onClickDate = () => {
		if (!active) {
			setAddFormState({
				...addFormState,
				active: true,
				mode: 'add',
				title: '',
				curDate: date,
				startHour: startHour,
				endHour: startHour + 1
			});
		}
	};

	const onClickSchedule = (e, schedule) => {
		e.stopPropagation();
		const { title, curDate, startHour, endHour } = schedule;
		if (!active) {
			setAddFormState({
				...addFormState,
				active: true,
				mode: 'edit',
				title: title,
				curDate: curDate,
				startHour: startHour,
				endHour: endHour
			});
		}
	};

	const onDropSchedule = (e) => {
		if (dragAndDrop.to.endHour > 24) return;
		const newSchedule = editDate(dragAndDrop.to, dragAndDrop.from, userData.schedule);

		if (newSchedule !== false) {
			setUserData({ ...userData, schedule: newSchedule });
			setAddFormState({ ...addFormState, active: false });
			setErrorState({
				...errorState,
				active: true,
				mode: 'edit',
				message: [ [ '일정이 수정 되었습니다.' ] ]
			});
		} else {
			setErrorState({
				...errorState,
				active: true,
				mode: 'fail',
				message: [ [ '일정을 수정할 수 없습니다.' ], [ '해당 시간에 이미 다른 일정이 존재합니다.' ] ]
			});
		}
	};

	const onDragCell = (e) => {
		setDragAndDrop({ ...dragAndDrop, from: schedule });
	};

	const onDragEnterCell = (e) => {
		const { from } = dragAndDrop;
		const diff = from.endHour - from.startHour;
		const newScheduleForm = { title: from.title, curDate: date, startHour, endHour: startHour + diff };
		setDragAndDrop({ ...dragAndDrop, to: newScheduleForm });
	};

	const onResizeMouseDown = (e, schedule) => {
		// 리사이즈 관련 이벤트 핸들러 정의
		const onResizeMouseMove = (e) => {
			const newY = e.clientY;
			const hourDifference = Math.round((initialY - newY) / 50); // 50px을 1시간으로 가정
			const newEndHour = Math.max(initialEndHour - hourDifference, startHour + 1); // 끝 시간이 시작 시간보다 작아지지 않도록

			// 일정의 끝 시간을 업데이트합니다.
			setUserData({
				...userData,
				schedule: userData.schedule.map((item) =>
					item === schedule ? { ...item, endHour: newEndHour } : item
				),
			});
		};

		const onResizeMouseUp = () => {
			document.removeEventListener('mousemove', onResizeMouseMove);
			document.removeEventListener('mouseup', onResizeMouseUp);
		};

		// 초기 상태 설정
		const initialY = e.clientY;
		const initialEndHour = schedule.endHour;

		document.addEventListener('mousemove', onResizeMouseMove);
		document.addEventListener('mouseup', onResizeMouseUp);
		e.preventDefault();
	};

	if (index === 0) {
		return (
			<div className={day === '일' ? 'weekly-cell sunday' : day === '토' ? 'weekly-cell saturday' : 'weekly-cell'}>
				{day}
			</div>
		);
	}

	if (index === 1)
		return (
			<div className={day === '일' ? 'weekly-cell sunday' : day === '토' ? 'weekly-cell saturday' : 'weekly-cell'}>
				{date.getDate()}
			</div>
		);

	return (
		<div className="weekly-cell" onClick={onClickDate} onDragEnter={onDragEnterCell} onDragEnd={onDropSchedule}>
			{schedule ? (
				<div
					className="weekly-schedule"
					style={height}
					onClick={(e) => onClickSchedule(e, schedule)}
					draggable
					onDragStart={(e) => onDragCell(e)}
				>
					<p>{schedule.startHour + '시 ~ ' + schedule.endHour + '시'}</p>
					<p>{schedule.title}</p>
					<div
						className="resize-handle"
						onMouseDown={(e) => onResizeMouseDown(e, schedule)}
					></div>
				</div>
			) : null}
		</div>
	);
};

export default DailyCell;
