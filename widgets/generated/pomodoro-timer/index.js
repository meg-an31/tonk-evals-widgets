import React from 'react';
import { WidgetDefinition } from '../../index';
import PomodoroTimerComponent from './component';

const widgetDefinition: WidgetDefinition = {
  id: 'pomodoro-timer',
  name: 'Pomodoro Timer',
  description: 'Focus timer with work and break cycles for productivity',
  component: PomodoroTimerComponent,
  defaultProps: {
    width: 300,
    height: 200,
  },
  icon: '⏰',
  category: 'productivity',
};

export default widgetDefinition;