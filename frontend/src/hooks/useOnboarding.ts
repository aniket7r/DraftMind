import { useState, useCallback } from 'react';

const STORAGE_KEY = 'draftmind-onboarding-dismissed';

export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  });

  const [currentStep, setCurrentStep] = useState(0);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowWelcome(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowWelcome(true);
    setCurrentStep(0);
  }, []);

  return {
    showWelcome,
    currentStep,
    totalSteps: 4,
    nextStep,
    prevStep,
    dismissWelcome,
    resetOnboarding,
  };
}
