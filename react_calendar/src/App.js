import React, { useState, useEffect } from 'react';
import './sass/app.css';
import ControlView from './js/containers/controlView/ControlView';
import CalendarView from './js/containers/calendarView/CalendarView';
import AddForm from './js/containers/components/AddForm';
import ErrorPopup from './js/containers/components/ErrorPopup';
import { useUserData } from './js/stores/userData';
const App = () => {
	const [ userData, setUserData ] = useUserData();

	useEffect(() => {
		loadUserData();
	}, []);

	useEffect(
		() => {
			saveUserData();
		},
		[ userData ]
	);

	const saveUserData = () => {
		const data = JSON.stringify(userData);
		localStorage.setItem('userData', data);
	};

	const loadUserData = () => {
		const data = JSON.parse(localStorage.getItem('userData'));
    if (!data || !Array.isArray(data.schedule)) {
      // If data is undefined or data.schedule is not an array, use default empty array
      return;
    }
		setUserData({
			...userData,
			schedule: data.schedule.map((a) => {
				return { ...a, curDate: new Date(a.curDate) };
			})
		});
	};

	return (
		<div id="app">
			<ControlView />
			<CalendarView />
			<AddForm />
			<ErrorPopup />
		</div>
	);
};

export default App;
