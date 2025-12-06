import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { QuestionnaireData } from '../types';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

const INITIAL_DATA: QuestionnaireData = {
  readingLevel: 'Intermediate',
  interests: [],
  primaryGoal: 'Summarization',
  dyslexiaFriendly: false,
  preferredLanguage: 'English',
  dailyReadingTime: '30 mins',
};

const STEPS = [
  { id: 'level', title: 'Reading Level', field: 'readingLevel', options: ['Elementary', 'Intermediate', 'Advanced', 'Academic'] },
  { id: 'goal', title: 'Primary Goal', field: 'primaryGoal', options: ['Summarization', 'Simplification', 'Translation', 'Study Aid'] },
  { id: 'time', title: 'Daily Reading Time', field: 'dailyReadingTime', options: ['15 mins', '30 mins', '1 hour', '2+ hours'] },
  { id: 'dyslexia', title: 'Accessibility', field: 'dyslexiaFriendly', type: 'boolean', label: 'Enable Dyslexia-friendly font?' },
  { id: 'lang', title: 'Preferred Language', field: 'preferredLanguage', options: ['English', 'Spanish', 'French', 'German'] },
  { id: 'interests', title: 'Interests', field: 'interests', type: 'multi', options: ['Technology', 'Science', 'History', 'Fiction', 'Business'] },
];

const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);

  const handleUpdate = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSave();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            questionnaire_completed: true,
            preferences: formData 
          }
        });
        if (error) throw error;
      } else {
        // Update mock
        const user = JSON.parse(localStorage.getItem('mock_user') || '{}');
        user.questionnaire_completed = true;
        user.preferences = formData;
        localStorage.setItem('mock_user', JSON.stringify(user));
        await new Promise(r => setTimeout(r, 1000));
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const btnClass = (active: boolean) => `
    flex items-center justify-between w-full p-4 mb-2 rounded-lg border text-left transition-all
    ${active
      ? 'bg-green-50 border-green-500 ring-1 ring-green-500'
      : 'bg-white border-gray-200 hover:bg-gray-50'
    }
  `;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-300 bg-green-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-8 rounded-xl shadow-sm min-h-[400px] flex flex-col bg-white border border-gray-100">
        <h2 className="text-2xl font-bold mb-6">{step.title}</h2>

        <div className="flex-1 space-y-3">
          {step.type === 'boolean' ? (
            <button
              onClick={() => handleUpdate(step.field as keyof QuestionnaireData, !formData[step.field as keyof QuestionnaireData])}
              className={btnClass(!!formData[step.field as keyof QuestionnaireData])}
            >
              <span>{step.label}</span>
              {!!formData[step.field as keyof QuestionnaireData] && <Check size={20} />}
            </button>
          ) : step.type === 'multi' ? (
            (step.options || []).map(opt => {
              const selected = (formData.interests || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    const current = formData.interests || [];
                    const newVal = selected ? current.filter(i => i !== opt) : [...current, opt];
                    handleUpdate('interests', newVal);
                  }}
                  className={btnClass(selected)}
                >
                  <span>{opt}</span>
                  {selected && <Check size={20} />}
                </button>
              )
            })
          ) : (
            (step.options || []).map(opt => (
              <button
                key={opt}
                onClick={() => handleUpdate(step.field as keyof QuestionnaireData, opt)}
                className={btnClass(formData[step.field as keyof QuestionnaireData] === opt)}
              >
                <span>{opt}</span>
                {formData[step.field as keyof QuestionnaireData] === opt && <Check size={20} />}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100/10">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium ${
              currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded font-bold shadow-md bg-green-600 text-white hover:bg-green-700"
          >
            {saving ? 'Saving...' : (currentStep === STEPS.length - 1 ? 'Finish' : 'Next')}
            {!saving && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;