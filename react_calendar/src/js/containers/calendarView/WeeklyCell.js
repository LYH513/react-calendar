import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import { editDate } from '../components/UserDataController';
// store
import { useErrorState } from '../../stores/errorState';
import { useAddFormState } from '../../stores/addFormState';
import { useUserData } from '../../stores/userData';
import { useDragAndDrop } from '../../stores/dragAndDrop';

const WeeklyCell = (props) => {
    const { index, day, date, startHour, schedule } = props;
    const [addFormState, setAddFormState] = useAddFormState();
    const { active } = addFormState;
    const [errorState, setErrorState] = useErrorState();
    const [userData, setUserData] = useUserData();
    const [dragAndDrop, setDragAndDrop] = useDragAndDrop();
    const [isResizing, setIsResizing] = useState(false); // 리사이징 상태 추가

    // console.log('주간 스케줄, 시간 프롭스', schedule, startHour);
    const [propsHour, propsMin] = (typeof startHour === 'string' ? startHour.split(':') : ['0', '0']).map(Number);

    // 마우스 업 이벤트를 처리하여 리사이징 종료
    useEffect(() => {
        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                document.body.classList.remove('resizing');
            }
        };

        if (isResizing) {
            document.body.classList.add('resizing');
            document.querySelectorAll('.weekly-schedule').forEach(el => el.classList.add('resizing'));
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.body.classList.remove('resizing');
            document.querySelectorAll('.weekly-schedule').forEach(el => el.classList.remove('resizing'));
        }

        return () => {
            document.body.classList.remove('resizing');
            document.querySelectorAll('.weekly-schedule').forEach(el => el.classList.remove('resizing'));
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // 분값을 15분 단위로 구간 나누어 변환하는 함수
    const to15MinRange = (minutes) => {
        if (minutes < 15) return 0;
        if (minutes < 30) return 15;
        if (minutes < 45) return 30;
        return 45;
    };
    
    // 50은 일정 한칸의 크기 , 22는 마진값?, 15는 분범위
    // 시간과 분을 분 단위로 변환하여 높이 계산
    const height = schedule
    ? {
            height: (( (schedule.endTime.hour * 60 + to15MinRange(schedule.endTime.minute)) - (schedule.startTime.hour * 60 + to15MinRange(schedule.startTime.minute)) ) / 15 * 50 - 22) + 'px'
        }
    : null;


	//빈 셀 클릭후 일정 추가
	const onClickDate = () => {
		if (!active&& !isResizing) {
	
			setAddFormState({
				...addFormState,
				active: true,
				mode: 'add',
				title: '',
				curDate: date, // Date 객체 그대로 유지
				startTime: { 
					hour: propsHour, 
					minute: propsMin, 
					second: 0, 
					nano:0 }, // 새로운 시간 형식 적용
				endTime: { 
					hour: propsHour +1, 
					minute: propsMin, 
					second: 0, 
					nano:0 } // 새로운 시간 형식 적용
			});
		}
	};
	

    //일정 수정
    const onClickSchedule = (e, schedule) => {
        e.stopPropagation();
        const { title, curDate, startTime, endTime } = schedule;
        if (!active && !isResizing) { // 리사이징 중일 때 클릭 방지
            setAddFormState({
                ...addFormState,
                active: true,
                mode: 'edit',
                title: title,
                curDate: curDate,
                startTime: {...startTime},
                endTime: {...endTime}
            });
        }
    };

//일정 드래그 앤 드랍 이동
    const onDropSchedule = (e) => {
        e.preventDefault();
        if (dragAndDrop.to.endTime.hour > 24) return;

        const { from, to, initialY } = dragAndDrop;

        // Y좌표의 차이 계산
        const yDifference = e.clientY - initialY;
        const Difference = Math.round(yDifference / 50)*15; // 50px = 15분씩 , 분 형태로 바꿈

        // 새로운 시작 시간과 끝 시간 계산
        const newStartTotalMin = (to.startTime.hour*60)+to.startTime.minute + Difference;

        // 기존 시간차 유지 + 끝 시간이 24를 넘지 않도록 보장
        const newEndHour = Math.min(newStartTotalMin + ((from.endTime.hour*60 + from.endTime.minute) - (from.startTime.hour*60 +from.startTime.minute)), 24*60);


        // 기존 일정 업데이트
        const updatedSchedule = userData.schedule.map(item =>
            item === from ? { ...item, 
                startTime: { 
                    ... from.startTime, 
                    hour: Math.floor(newStartTotalMin/60),
                    minute:  newStartTotalMin%60
                }, 
                endTime: {
                    ...from.endTime,
                    hour: Math.floor(newEndHour/60),
                    minute: newEndHour%60
                }, 
                curDate: date } : item
        );

        console.log("from", from);
        console.log("to", to);
        console.log("Y difference:", yDifference);
        console.log("New start hour:", newStartTotalMin);
        console.log("New end hour:", newEndHour);

        // 일정 업데이트
        setUserData({ ...userData, schedule: updatedSchedule });
        setAddFormState({ ...addFormState, active: false });
        setErrorState({
            ...errorState,
            active: true,
            mode: 'edit',
            message: [['일정이 수정 되었습니다.']]
        });
    };

    const onDragEnterCell = (e) => {
        e.preventDefault();
        const { from } = dragAndDrop;
        console.log('드래그', from);
        const diff = (from.endTime.hour*60 + from.endTime.minute) - (from.startTime.hour*60 +from.startTime.minute);

        const newScheduleForm = { title: from.title, curDate: date,
            startTime :{
                ...from.startTime,
                hour: propsHour,
                minute: propsMin
            },
            endTime:{
                ...from.endTime,
                hour: propsHour + Math.floor(diff/60),
                minute: propsMin +(diff%60)
            }};

        // 현재 Y좌표 저장
        setDragAndDrop({ ...dragAndDrop, to: newScheduleForm, initialY: e.clientY });

        // 콘솔에 시작 시간 변화를 로그로 출력
        console.log("Original start hour:", from.startTime.hour);
        console.log("New start hour", propsHour);
    };

//리사이징
    const onDragCell = (e) => {
        if (!isResizing) { // 리사이징 중일 때 드래그 방지
            setDragAndDrop({ ...dragAndDrop, from: schedule });
        }
    };

    const onResizeMouseDown = (e, schedule) => {
        e.preventDefault(); // 기본 동작 방지
        e.stopPropagation(); // 클릭 이벤트 상위 전파 방지

        console.log('주간 리사이징', schedule);

        const initialY = e.clientY;
        const initialEndMinute = schedule.endTime.hour * 60 + schedule.endTime.minute;

        // 마우스 이동 핸들러 정의
        const onResizeMouseMove = (e) => {
            const newY = e.clientY;
            const minDifference = Math.round((newY - initialY) / 50) * 15; // 50px = 15분
            const newEndMinute = Math.min(Math.max(initialEndMinute + minDifference, schedule.startTime.hour * 60 + schedule.startTime.minute + 15), 24 * 60); // 최소 15분 증가, 최대 24시간

            // 일정의 끝 시간을 업데이트합니다.
            setUserData({
                ...userData,
                schedule: userData.schedule.map((item) =>
                    item === schedule ? { ...item, 
                        endTime: {
                            ...schedule.endTime,
                            hour: Math.floor(newEndMinute / 60),
                            minute: newEndMinute % 60
                        } 
                    } : item
                ),
            });
        };

        // 마우스 업 핸들러 정의
        const onResizeMouseUp = () => {
            document.removeEventListener('mousemove', onResizeMouseMove);
            document.removeEventListener('mouseup', onResizeMouseUp);
            setIsResizing(false);
            document.body.classList.remove('resizing');
        };

        document.addEventListener('mousemove', onResizeMouseMove);
        document.addEventListener('mouseup', onResizeMouseUp);
        setIsResizing(true);
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
        <div className="weekly-cell" 
            onClick={onClickDate} 
            onDragEnter={onDragEnterCell} 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={onDropSchedule}>

            {schedule ? (
                <div
                    className={`weekly-schedule ${isResizing ? 'resizing' : ''}`}
                    style={height}
                    onClick={(e) => onClickSchedule(e, schedule)}
                    draggable
                    onDragStart={(e) => onDragCell(e)}
                >
                    <p>{schedule.startTime.hour+':'+schedule.startTime.minute+'~'+schedule.endTime.hour+':'+schedule.endTime.minute}</p>
                    <p>{schedule.title}</p>
                    <div
                        className="resize-handle"
                        onMouseDown={(e) => onResizeMouseDown(e, schedule)}
                        onClick={(e) => e.stopPropagation()}
                    ></div>
                </div>
            ) : null}
        </div>
    );
};

export default WeeklyCell;
