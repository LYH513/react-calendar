import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import { editDate } from '../components/UserDataController';
// store
import { useErrorState } from '../../stores/errorState';
import { useAddFormState } from '../../stores/addFormState';
import { useUserData } from '../../stores/userData';
import { useDragAndDrop } from '../../stores/dragAndDrop';

const DailyCell = (props) => {
    const { index, day, date, startHour, schedule } = props;
    const [addFormState, setAddFormState] = useAddFormState();
    const { active } = addFormState;
    const [errorState, setErrorState] = useErrorState();
    const [userData, setUserData] = useUserData();
    const [dragAndDrop, setDragAndDrop] = useDragAndDrop();
    const [isResizing, setIsResizing] = useState(false); // 리사이징 상태 추가

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

    const height = schedule
        ? {
                height: (schedule.endHour - schedule.startHour) * 50 - 22 + 'px'
            }
        : null;

    const onClickDate = () => {
        if (!active && !isResizing) { // 리사이징 중일 때 클릭 방지
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
        if (!active && !isResizing) { // 리사이징 중일 때 클릭 방지
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
        e.preventDefault();
        if (dragAndDrop.to.endHour > 24) return;

        const { from, to, initialY } = dragAndDrop;

        // Y좌표의 차이 계산
        const yDifference = e.clientY - initialY;
        const hourDifference = Math.round(yDifference / 50); // 50px = 1시간

        // 새로운 시작 시간과 끝 시간 계산
        const newStartHour = to.startHour + hourDifference;
        const newEndHour = newStartHour + (from.endHour - from.startHour); // 기존 시간 차이를 유지

        // 기존 일정 업데이트
        const updatedSchedule = userData.schedule.map(item =>
            item === from ? { ...item, startHour: newStartHour, endHour: newEndHour, curDate: date } : item
        );

        console.log("from", from);
        console.log("to", to);
        console.log("Y difference:", yDifference);
        console.log("New start hour:", newStartHour);
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

    const onDragCell = (e) => {
        if (!isResizing) { // 리사이징 중일 때 드래그 방지
            setDragAndDrop({ ...dragAndDrop, from: schedule });
        }
    };

    const onDragEnterCell = (e) => {
        e.preventDefault();
        const { from } = dragAndDrop;
        const diff = from.endHour - from.startHour;
        const newScheduleForm = { title: from.title, curDate: date, startHour, endHour: startHour + diff };

        // 현재 Y좌표 저장
        setDragAndDrop({ ...dragAndDrop, to: newScheduleForm, initialY: e.clientY });

        // 콘솔에 시작 시간 변화를 로그로 출력
        console.log("Original start hour:", from.startHour);
        console.log("New start hour", startHour);
    };

    const onResizeMouseDown = (e, schedule) => {
        e.preventDefault(); // 기본 동작 방지
        e.stopPropagation(); // 클릭 이벤트 상위 전파 방지

        const initialY = e.clientY;
        const initialEndHour = schedule.endHour;

        // 마우스 이동 핸들러 정의
        const onResizeMouseMove = (e) => {
            const newY = e.clientY;
            const hourDifference = Math.round((newY - initialY) / 50); // 50px을 1시간으로 가정
            const newEndHour = Math.max(initialEndHour + hourDifference, schedule.startHour + 1); // 끝 시간이 시작 시간보다 작아지지 않도록

            // 일정의 끝 시간을 업데이트합니다.
            setUserData({
                ...userData,
                schedule: userData.schedule.map((item) =>
                    item === schedule ? { ...item, endHour: newEndHour } : item
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
        <div className="weekly-cell" onClick={onClickDate} onDragEnter={onDragEnterCell} onDragOver={(e) => e.preventDefault()} onDrop={onDropSchedule}>
            {schedule ? (
                <div
                    className={`weekly-schedule ${isResizing ? 'resizing' : ''}`}
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
                        onClick={(e) => e.stopPropagation()}
                    ></div>
                </div>
            ) : null}
        </div>
    );
};

export default DailyCell;
