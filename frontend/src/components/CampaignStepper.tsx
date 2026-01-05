'use client';

import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography,
  Card,
  CardContent
} from '@mui/material';

interface CampaignStepperProps {
  steps: string[];
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  nextButtonText?: string;
  backButtonText?: string;
  finishButtonText?: string;
  onFinish?: () => void;
  loading?: boolean;
}

export function CampaignStepper({
  steps,
  activeStep,
  onNext,
  onBack,
  children,
  isNextDisabled = false,
  isBackDisabled = false,
  nextButtonText = 'Next',
  backButtonText = 'Back',
  finishButtonText = 'Finish',
  onFinish,
  loading = false
}: CampaignStepperProps) {
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box>
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {children}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={activeStep === 0 || isBackDisabled || loading}
          sx={{ 
            color: '#000000', 
            borderColor: '#000000',
            '&:hover': {
              borderColor: '#333333',
              backgroundColor: 'rgba(0,0,0,0.03)'
            }
          }}
        >
          {backButtonText}
        </Button>
        
        {isLastStep ? (
          <Button
            variant="contained"
            onClick={onFinish}
            disabled={isNextDisabled || loading}
            sx={{ 
              bgcolor: '#000000', 
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#333333'
              }
            }}
          >
            {loading ? 'Creating...' : finishButtonText}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={isNextDisabled || loading}
            sx={{ 
              bgcolor: '#000000', 
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#333333'
              }
            }}
          >
            {nextButtonText}
          </Button>
        )}
      </Box>
    </Box>
  );
}