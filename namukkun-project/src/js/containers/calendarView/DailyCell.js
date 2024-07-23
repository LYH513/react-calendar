import React, { useCallback, useRef, useState } from 'react';
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

  // 핸들 크기 조정 관련 상태
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null); // 'bottom' 만 사용
  const scheduleRef = useRef(null); // 일정 박스에 대한 참조

  // 일정 높이와 위치를 결정하는 함수
  const getScheduleHeight = (startHour, endHour) => {
    return (endHour - startHour) * 50 - 22 + 'px'; // 높이를 계산합니다.
  };

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
        message: [['일정이 수정 되었습니다.']]
      });
    } else {
      setErrorState({
        ...errorState,
        active: true,
        mode: 'fail',
        message: [['일정을 수정할 수 없습니다.'], ['해당 시간에 이미 다른 일정이 존재합니다.']]
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

  // 크기 조정 시작
  const onResizeStart = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true); // 크기 조정 시작
  };

  // 크기 조정 중
  const onMouseMove = useCallback(
    (e) => {
      if (!isResizing || !scheduleRef.current) return;
      const scheduleElement = scheduleRef.current;
      const rect = scheduleElement.getBoundingClientRect();
      const deltaY = e.clientY - rect.top; // 마우스 이동 거리
      const cellHeight = 50; // 셀 높이 (기본 값)

      console.log('Resize Direction:', resizeDirection);
      console.log('Delta Y:', deltaY);

      if (resizeDirection === 'bottom') {
        const newEndHour = startHour + Math.ceil(deltaY / cellHeight);
        setAddFormState({
          ...addFormState,
          endHour: newEndHour, // 하단 조정 시 endHour 업데이트
        });
        console.log("bottom", newEndHour);
      }
    },
    [isResizing, resizeDirection, startHour, addFormState, setAddFormState]
  );

  // 크기 조정 끝
  const onMouseUp = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove]);

  if (index === 1)
    return (
      <div className={day === '일' ? 'weekly-cell sunday' : day === '토' ? 'weekly-cell saturday' : 'weekly-cell'}>
        {date.getDate()}
      </div>
    );

  return (
    <div
      className="weekly-cell"
      onClick={onClickDate}
      onDragEnter={onDragEnterCell}
      onDragEnd={onDropSchedule}
    >
      {schedule ? (
        <div
          className="weekly-schedule"
          style={{ height: getScheduleHeight(addFormState.startHour, addFormState.endHour) }} // 동적 높이 설정
          onClick={(e) => onClickSchedule(e, schedule)}
          draggable
          onDragStart={(e) => onDragCell(e)}
          ref={scheduleRef} // 일정 박스에 대한 참조 설정
        >
          {/* 상단 핸들 제거 */}
          <div
            className="resize-bottom"
            onMouseDown={onResizeStart('bottom')} // 하단 핸들 클릭 시 크기 조정 시작
          ></div>
          <p>{addFormState.startHour + '시 ~ ' + addFormState.endHour + '시'}</p>
          <p>{schedule.title}</p>
        </div>
      ) : null}
    </div>
  );
};

export default DailyCell;
