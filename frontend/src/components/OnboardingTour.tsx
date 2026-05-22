import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';

const OnboardingTour: React.FC = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('aion_tour_completed');
    if (!hasCompletedTour) {
      setTimeout(() => setRun(true), 1500);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('aion_tour_completed', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-quick-log',
      content: 'Here you can quickly log your hours for the day. Select your task, enter hours, and submit!',
    },
    {
      target: '.tour-daily-chart',
      content: 'Keep track of your daily goal (usually 8 hours) here.',
    },
    {
      target: '.tour-dashboard',
      content: 'View recent team activity and manage your draft time entries. You can submit or edit them here.',
    },
    {
      target: '.tour-smart-insights',
      content: 'AI-driven suggestions for your next task based on your assignments and history.',
    },
    {
      target: '.tour-calendar',
      content: 'Select a date on the calendar to view or edit specific time logs for that day.',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
    />
  );
};

export default OnboardingTour;
