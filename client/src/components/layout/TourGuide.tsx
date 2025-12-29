import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from 'react-joyride';
import { useLocation } from 'wouter';
import { useTheme } from 'next-themes';

interface TourGuideProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export function TourGuide({ run, setRun }: TourGuideProps) {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();
  
  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Welcome to SVI Platform</h3>
          <p>Let's take a quick tour of the Startup Valuation Intelligence dashboard.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="dashboard-nav"]',
      content: 'Your command center. See your valuation summary, key metrics, and recent activity here.',
    },
    {
      target: '[data-tour="valuation-engine-nav"]',
      content: 'The core calculator. Combine VC Method, Scorecard, and DCF models to triangulate your value.',
    },
    {
      target: '[data-tour="comps-nav"]',
      content: 'Market Comparables. Find similar companies and benchmark your metrics against real market data.',
    },
    {
      target: '[data-tour="scenarios-nav"]',
      content: 'Plan for the future. Model different funding rounds, exits, and growth scenarios.',
    },
    {
      target: '[data-tour="reports-nav"]',
      content: 'Generate investor-ready PDFs and one-pagers based on your valuation data.',
    },
    {
        target: '[data-tour="quick-actions"]',
        content: 'Quickly access common tasks like creating a new report or updating your metrics.',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#10b981', // Emerald 500
          textColor: theme === 'dark' ? '#fff' : '#000',
          backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
          arrowColor: theme === 'dark' ? '#1e293b' : '#fff',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
        },
        buttonBack: {
            color: 'hsl(var(--muted-foreground))',
        }
      }}
    />
  );
}
