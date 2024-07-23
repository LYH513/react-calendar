import React, { useState, useEffect } from 'react';
import '../../../sass/app.css';
import WeeklyCell from './WeeklyCell'; // WeeklyCell을 사용하는데, 필요에 따라 DailyCell로 변경
import { getSchedule } from '../components/UserDataController';
// store
import { useCalendarState } from '../../stores/calendarState';
import { useUserData } from '../../stores/userData';
import DailyCell from './DailyCell';

const Daily = () => {
    const [calendarState, setCalendarState] = useCalendarState();
    const { date } = calendarState;

    const [timeTable, setTimeTable] = useState([
        ' ', ' ', // 2개의 빈 공간을 시간 테이블의 시작으로 설정
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ]);

    const [userData, setUserData] = useUserData();
    const { schedule } = userData;

    const [curSchedule, setCurSchedule] = useState([]);
    const [dates, setDates] = useState([]);

    useEffect(() => {
        // date가 변경될 때마다, 해당 날짜에 대한 일정을 생성합니다.
        const { firstDate, lastDate } = getFirstAndLastDate();
        setDates(makeCalendar(firstDate));
    }, [date]);

    useEffect(() => {
        // userData가 변경될 때마다, 현재 일정을 업데이트합니다.
        const { firstDate, lastDate } = getFirstAndLastDate();
        setCurSchedule(getSchedule(firstDate, lastDate, schedule));
    }, [userData]);

    const getFirstAndLastDate = () => {
        // 단일 날짜를 반환하도록 수정된 함수
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const firstDate = new Date(year, month, day); // 현재 선택된 날짜
        return { firstDate, lastDate: firstDate }; // firstDate와 lastDate가 동일
    };

    const makeCalendar = (currentDate) => {
      const timeArray = [' ', ' ', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      const newDates = [[currentDate].concat(timeArray)]; // 현재 날짜와 시간 배열을 결합
        setCurSchedule(getSchedule(currentDate, currentDate, schedule)); // 현재 날짜에 해당하는 일정을 설정
        return newDates;
    };

    const getCurDateSchedule = (curDate, startHour) => {
        // 특정 날짜와 시간에 해당하는 일정을 반환
        let curDateSchedule = null;

        for (let i = 0; i < curSchedule.length; i++) {
            if (curDate.getTime() === curSchedule[i].curDate.getTime() && curSchedule[i].startHour === startHour) {
                curDateSchedule = curSchedule[i];
                break;
            }
        }

        return curDateSchedule;
    };

    return (
        <div id="weekly-view"> {/* 일간 보기로 변경 */}
            <div className="hour-col">
                {timeTable.map((a, i) => (
                    <div key={i} className="hour-cell">
                        {a}
                    </div>
                ))}
            </div>
            {dates.map((a, i) => (
                <div key={i} className="weekly-col"> {/* 일간 보기를 위한 컬럼 */}
                    {a.map((b, j) => (
                        j > 0 && ( // 시간 데이터만 표시 (날짜 데이터 제외)
                            <DailyCell // WeeklyCell을 사용하는데, 필요하다면 DailyCell로 변경
                                key={j}
                                index={j}
                                date={a[0]}
                                startHour={b}
                                schedule={getCurDateSchedule(a[0], b)}
                            />
                        )
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Daily;
