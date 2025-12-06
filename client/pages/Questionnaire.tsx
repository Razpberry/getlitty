import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAccessibility } from '../context/AccessibilityContext';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

type QuestionnaireData = {
  // Q1
  challenges: string[];
  challengesOther: string;
  // Q2
  improvements: string[];
  improvementsOther: string;
  // Q3
  docTypes: string[];
  docTypesOther: string;
  // Q4 (optional)
  diagnosed: string[];
  // Q5
  otherChanges: string;
};

const INITIAL_DATA: QuestionnaireData = {
  challenges: [],
  challengesOther: '',
  improvements: [],
  improvementsOther: '',
  docTypes: [],
  docTypesOther: '',
  diagnosed: [],
  otherChanges: '',
};

const STEPS = [
  { id: 'challenges', title: 'What challenges do you face when reading documents?' },
  { id: 'improvements', title: 'What would help improve your reading experience?' },
  { id: 'docTypes', title: 'What types of documents do you struggle with most?' },
  { id: 'diagnosed', title: 'Do you have any diagnosed reading disabilities or accessibility needs? (Optional)' },
  { id: 'otherChanges', title: 'Do you have any other changes you want us to implement? (Optional)' },
];

const CHALLENGES = [
  'Difficulty focusing on long or dense text (ADHD / attention-related)',
  'English is not my first language (ESL / newcomer)',
  'Trouble understanding complex academic or technical vocabulary',
  'Difficulty processing text quickly (slow reading speed)',
  'Trouble with font size, spacing, or visual clutter',
  'Letters/words appear jumbled or hard to track (dyslexia or similar)',
  'Difficulty with long paragraphs',
  'Trouble remembering or summarizing what I read',
  'Other',
];

const IMPROVEMENTS = [
  'Simpler vocabulary',
  'Shortened / summarized versions',
  'Clearer layout (spacing, headings, bullet points)',
  'Dyslexia-friendly formatting (fonts, alignment)',
  'Larger text size',
  'Colour contrast adjustments',
  'Visual summaries (key points highlighted)',
  'Bilingual support or translation (optional future feature)',
  'Definitions for difficult words',
  'Audio version of text (future idea—can still list)',
];

const DOC_TYPES = [
  'School assignments or research papers',
  'PDF forms (government, school, etc.)',
  'PowerPoint presentations',
  'Text-heavy articles or textbooks',
  'Instructions or manuals',
  'Other',
];

const DIAGNOSED = ['ADHD', 'Dyslexia', 'Vision impairment', 'None', 'Prefer not to say'];

const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { highContrast } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const btnClass = (active: boolean) => `
    flex items-center justify-between w-full p-4 mb-2 rounded-lg border text-left transition-all
    ${active
      ? (highContrast ? 'bg-yellow-400 text-black border-yellow-500 font-bold' : 'bg-brand-50 border-brand-500 ring-1 ring-brand-500')
      : (highContrast ? 'bg-gray-800 text-yellow-100 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50')}
  `;

  const toggleMulti = (field: keyof QuestionnaireData, value: string) => {
    setFormData(prev => {
      const arr = [...(prev[field] as string[])] as string[];
      const has = arr.includes(value);
      const next = has ? arr.filter(a => a !== value) : [...arr, value];
      return { ...prev, [field]: next } as QuestionnaireData;
    });
  };

  const setField = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else handleSave();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const buildDetailsString = (data: QuestionnaireData) => {
    // The user asked: "space separated format doesn't matter just all the answers appended in text"
    // We'll append labeled parts but separated by spaces; arrays joined by commas.
    const parts: string[] = [];

    if (data.challenges.length) parts.push(`challenges:${data.challenges.join(',')}`);
    if (data.challengesOther?.trim()) parts.push(`challengesOther:${data.challengesOther.trim()}`);

    if (data.improvements.length) parts.push(`improvements:${data.improvements.join(',')}`);
    if (data.improvementsOther?.trim()) parts.push(`improvementsOther:${data.improvementsOther.trim()}`);

    if (data.docTypes.length) parts.push(`docTypes:${data.docTypes.join(',')}`);
    if (data.docTypesOther?.trim()) parts.push(`docTypesOther:${data.docTypesOther.trim()}`);

    if (data.diagnosed.length) parts.push(`diagnosed:${data.diagnosed.join(',')}`);

    if (data.otherChanges?.trim()) parts.push(`otherChanges:${data.otherChanges.trim()}`);

    // join with space (single string)
    return parts.join(' ');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const detailsString = buildDetailsString(formData);

      if (isSupabaseConfigured()) {
        // get current user
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
          throw userErr || new Error('No authenticated user found');
        }

        // Update profiles.details and questionnaire_completed
        const updates: any = {
          details: detailsString,
        };

        // supabase-js v2: use from().update().eq().select()
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select();

        if (error) throw error;
      } else {
        // mock local storage fallback
        const user = JSON.parse(localStorage.getItem('mock_user') || '{}');
        user.questionnaire_completed = true;
        user.details = (user.details ? user.details + ' ' : '') + detailsString;
        localStorage.setItem('mock_user', JSON.stringify(user));
        // simulate latency
        await new Promise(r => setTimeout(r, 800));
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving questionnaire:', err);
      alert('Failed to save questionnaire. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <div className={`h-2 w-full rounded-full ${highContrast ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${highContrast ? 'bg-yellow-400' : 'bg-brand-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`p-8 rounded-xl shadow-sm min-h-[420px] flex flex-col ${highContrast ? 'bg-gray-900 border border-yellow-700' : 'bg-white border border-gray-100'}`}>
        <h2 className="text-2xl font-bold mb-6">{step.title}</h2>

        <div className="flex-1 space-y-3">
          {/* Q1 */}
          {step.id === 'challenges' && (
            <>
              {CHALLENGES.map(opt => {
                const selected = formData.challenges.includes(opt);
                return (
                  <div key={opt} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMulti('challenges', opt)}
                      className={btnClass(selected)}
                      type="button"
                    >
                      <span>{opt}</span>
                      {selected && <Check size={20} />}
                    </button>
                    {opt === 'Other' && formData.challenges.includes('Other') && (
                      <input
                        type="text"
                        placeholder="Please specify"
                        value={formData.challengesOther}
                        onChange={e => setField('challengesOther', e.target.value)}
                        className="ml-2 p-2 border rounded w-full"
                      />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Q2 */}
          {step.id === 'improvements' && (
            <>
              {IMPROVEMENTS.map(opt => {
                const selected = formData.improvements.includes(opt);
                return (
                  <div key={opt} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMulti('improvements', opt)}
                      className={btnClass(selected)}
                      type="button"
                    >
                      <span>{opt}</span>
                      {selected && <Check size={20} />}
                    </button>
                    {opt === 'Audio version of text (future idea—can still list)' && formData.improvements.includes(opt) && (
                      // no extra input here, example only; keep consistent behaviour
                      null
                    )}
                  </div>
                );
              })}

              {/* optional other input */}
              {formData.improvements.includes('Bilingual support or translation (optional future feature)') && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Any language preferences?"
                    value={formData.improvementsOther}
                    onChange={e => setField('improvementsOther', e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </div>
              )}
            </>
          )}

          {/* Q3 */}
          {step.id === 'docTypes' && (
            <>
              {DOC_TYPES.map(opt => {
                const selected = formData.docTypes.includes(opt);
                return (
                  <div key={opt} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMulti('docTypes', opt)}
                      className={btnClass(selected)}
                      type="button"
                    >
                      <span>{opt}</span>
                      {selected && <Check size={20} />}
                    </button>
                    {opt === 'Other' && formData.docTypes.includes('Other') && (
                      <input
                        type="text"
                        placeholder="Please specify"
                        value={formData.docTypesOther}
                        onChange={e => setField('docTypesOther', e.target.value)}
                        className="ml-2 p-2 border rounded w-full"
                      />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Q4 */}
          {step.id === 'diagnosed' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIAGNOSED.map(opt => {
                  const selected = formData.diagnosed.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMulti('diagnosed', opt)}
                      className={btnClass(selected)}
                      type="button"
                    >
                      <span>{opt}</span>
                      {selected && <Check size={20} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Q5 */}
          {step.id === 'otherChanges' && (
            <textarea
              placeholder="Describe any other changes you'd like..."
              value={formData.otherChanges}
              onChange={e => setField('otherChanges', e.target.value)}
              className="w-full p-3 border rounded min-h-[140px]"
            />
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
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold shadow-md ${
              highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
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
