import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../sass/app.css';
import { insertDate, deleteDate, editDate } from './UserDataController';
// store
import { useAddFormState } from '../../stores/addFormState';
import { useUserData } from '../../stores/userData';
import { useErrorState } from '../../stores/errorState';

const AddForm = () => {
  const [addFormState, setAddFormState] = useAddFormState();
  const { active, mode } = addFormState;

  const [newAddFormState, setNewAddFormState] = useState({
    title: '',
    curDate: new Date(),
    startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    endTime: { hour: 1, minute: 0, second: 0, nano: 0 }
  });
  const { title, curDate, startTime, endTime } = newAddFormState;
  const [userData, setUserData] = useUserData();
  const { schedule } = userData;
  const [beforeEdit, setBeforeEdit] = useState();
  const [errorState, setErrorState] = useErrorState();

  useEffect(() => {
    if (active) {
      const { title, curDate, startTime, endTime } = addFormState;
      setNewAddFormState({
        title: title || '',
        curDate: curDate || new Date(),
        startTime: startTime || { hour: 0, minute: 0, second: 0, nano: 0 },
        endTime: endTime || { hour: 1, minute: 0, second: 0, nano: 0 }
      });
      if (mode === 'edit') {
        setBeforeEdit({ title, curDate, startTime, endTime });
      }
    }
  }, [active, addFormState, mode]);

  const onChangeCurDate = (value) => {
    setNewAddFormState({ ...newAddFormState, curDate: value });
  };

  const onChangeNewAddFormState = (e) => {
    const { id, value } = e.target;
    const intValue = parseInt(value, 10);
    switch (id) {
      case 'input-title':
        setNewAddFormState({ ...newAddFormState, title: value });
        break;
      case 'start-hour':
        setNewAddFormState({
          ...newAddFormState,
          startTime: { ...startTime, hour: intValue }
        });
        break;
      case 'start-minute':
        setNewAddFormState({
          ...newAddFormState,
          startTime: { ...startTime, minute: intValue }
        });
        break;
      case 'end-hour':
        setNewAddFormState({
          ...newAddFormState,
          endTime: { ...endTime, hour: intValue }
        });
        break;
      case 'end-minute':
        setNewAddFormState({
          ...newAddFormState,
          endTime: { ...endTime, minute: intValue }
        });
        break;
      default:
        break;
    }
  };

  const onClickCancel = () => {
    setAddFormState({ ...addFormState, active: false });
  };

  const onClickAdd = () => {
    if (title === '') return;

    const newSchedule = insertDate(newAddFormState, schedule);
    if (newSchedule !== false) {
			console.log("일정추가", newAddFormState);
      setUserData({ ...userData, schedule: newSchedule });
      setAddFormState({ ...addFormState, active: false });
      setErrorState({
        ...errorState,
        active: true,
        mode: 'add',
        message: [['일정이 추가 되었습니다.']]
      });
    } else {
      setErrorState({
        ...errorState,
        active: true,
        mode: 'fail',
        message: [['일정을 추가할 수 없습니다.'], ['해당 시간에 이미 다른 일정이 존재합니다.']]
      });
    }
  };

  const onClickEdit = () => {
    if (title === '') return;

    const newSchedule = editDate(newAddFormState, beforeEdit, schedule);

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

  const onClickDelete = () => {
    const newSchedule = deleteDate(curDate, startTime, endTime, schedule);
    setUserData({ ...userData, schedule: newSchedule });
    setAddFormState({ ...addFormState, active: false });
    setErrorState({
      ...errorState,
      active: true,
      mode: 'delete',
      message: [['일정이 삭제 되었습니다.']]
    });
  };

  if (!active) return null;
  else if (active)
    return (
      <div id="panel">
        <div id="add-form">
          <div id="add-form-title">{mode === 'add' ? '일정 추가' : '일정 수정'}</div>
          <div id="input-form">
            <div className="label">제목</div>
            <input id="input-title" value={title} onChange={onChangeNewAddFormState} />
          </div>
          <div id="date-picker-form">
            <div className="label">날짜</div>
            <div id="date-picker">
              <DatePicker selected={curDate} onChange={onChangeCurDate} />
            </div>
          </div>
          <div id="time-picker-form">
            <div className="label">시작 시간</div>
            <div>
              <select id="start-hour" value={startTime.hour} onChange={onChangeNewAddFormState}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              시
              <select id="start-minute" value={startTime.minute} onChange={onChangeNewAddFormState}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              분
            </div>
          </div>
          <div id="time-picker-form">
            <div className="label">종료 시간</div>
            <div>
              <select id="end-hour" value={endTime.hour} onChange={onChangeNewAddFormState}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              시
              <select id="end-minute" value={endTime.minute} onChange={onChangeNewAddFormState}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              분
            </div>
          </div>
          <div id="option-form">
            <div id="cancel-btn" className="btn" onClick={onClickCancel}>
              취소
            </div>
            {mode === 'add' ? (
              <div id="add-btn" className="btn" onClick={onClickAdd}>
                저장
              </div>
            ) : null}
            {mode === 'edit' ? (
              <>
                <div id="edit-btn" className="btn" onClick={onClickEdit}>
                  수정
                </div>
                <div id="delete-btn" className="btn" onClick={onClickDelete}>
                  삭제
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
};

export default AddForm;
