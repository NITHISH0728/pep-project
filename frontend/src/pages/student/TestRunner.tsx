import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAntiCheat } from './useAntiCheat';
import './student.css';

const TestRunner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  
  // Anti-Cheat Initialization
  const { enterFullscreen } = useAntiCheat({
    maxTabSwitches: 2,
    maxFullscreenEscapes: 2,
    onWarning: (reason, warningsLeft) => {
      setWarningMessage(`WARNING: ${reason} (Remaining warnings: ${warningsLeft})`);
      if (!reason.includes('full-screen')) {
         setTimeout(() => setWarningMessage(''), 5000); // Hide tab switch warnings after 5s
      }
    },
    onTerminate: async (reason) => {
      alert(`TEST TERMINATED: ${reason}`);
      await forceSubmit(0);
    }
  });

  useEffect(() => {
    fetchTest();
    enterFullscreen();
  }, [id]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${id}`).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        setTest(data);
      } else {
        alert("Test not found");
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceSubmit = async (score: number) => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) return;

      const payload = {
        test_id: parseInt(id || '0'),
        student_id: user._id,
        score: score,
        total_marks: test?.duration_minutes || 10,
        status: 'completed'
      };

      await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null); // ignore db failure for now
      
      if (document.fullscreenElement) {
         document.exitFullscreen().catch(e => console.error(e));
      }
      navigate('/student');
      alert("Test Submitted successfully.");
    } catch(err) {
      console.error("Submit error", err);
      navigate('/student');
    }
  };

  const handleManualSubmit = () => {
     forceSubmit(Math.floor(Math.random() * 10) + 1); // Mock Score submission 
  };

  const testStyles = (
    <style>{`
      .student-nav { display: none !important; }
      .student-page-content { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
      body { background-color: #F8FAFC !important; }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in { animation: fadeIn 0.4s ease-out forwards; }
      
      .test-btn-runner {
         transition: all 0.2s ease-in-out;
      }
      .test-btn-runner:hover:not(:disabled) {
         transform: scale(1.02) translateY(-1px);
         box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4) !important;
      }

      .question-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        transition: all 0.3s ease;
        margin-bottom: 32px;
      }
      .question-card:hover {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      }

      .mcq-option {
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        background: #ffffff;
        padding: 18px 24px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        box-sizing: border-box;
        color: #1e293b;
        font-weight: 500;
        position: relative;
      }
      .mcq-option:hover {
        background: #fefce8;
        border-color: #f5b400;
        transform: translateY(-2px);
      }
      .mcq-option:has(input:checked) {
        border-color: #f5b400;
        background: #fef08a;
        box-shadow: 0 4px 14px rgba(245, 180, 0, 0.15);
      }
      .mcq-option input[type="radio"] {
        appearance: none;
        width: 22px;
        height: 22px;
        border: 2px solid #cbd5e1;
        border-radius: 50%;
        margin: 0;
        transition: all 0.2s ease;
        display: grid;
        place-content: center;
      }
      .mcq-option input[type="radio"]::before {
        content: "";
        width: 12px;
        height: 12px;
        border-radius: 50%;
        transform: scale(0);
        transition: 0.2s transform ease-in-out;
        background: #f5b400;
      }
      .mcq-option:has(input:checked) input[type="radio"] {
        border-color: #f5b400;
      }
      .mcq-option:has(input:checked) input[type="radio"]::before {
        transform: scale(1);
        background: #f5b400;
      }

      .runner-timer {
        background: transparent;
        color: #f5b400;
        padding: 8px 24px;
        border-radius: 9999px;
        border: 1px solid rgba(245, 180, 0, 0.5);
        font-weight: 700;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 0 15px rgba(245, 180, 0, 0.15);
        transition: all 0.3s ease-in-out;
      }
    `}</style>
  );

  if (loading) return <div style={{ color: '#0f172a', padding: '40px', textAlign: 'center', background: '#F8FAFC', minHeight: '100vh' }}>{testStyles}Loading secure environment...</div>;

  const warningOverlay = warningMessage && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', width: '90%', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.1)' }}>
        <h2 style={{ color: '#ef4444', margin: '0 0 16px', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>⚠️ WARNING</h2>
        <p style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6', margin: '0 0 32px' }}>{warningMessage}</p>
        {warningMessage.includes('full-screen') && (
          <button 
            className="test-btn-runner" 
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', width: '100%', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}
            onClick={() => {
              enterFullscreen();
              setWarningMessage('');
            }}
          >
            Return to Full Screen
          </button>
        )}
      </div>
    </div>
  );

  // ====== CODE TEST LAYOUT (LEETCODE CLONE) ======
  if (test?.test_type === 'code') {
      const p = test.problems && test.problems.length > 0 ? test.problems[currentProblemIndex] : null;
      
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: 'flex', background: '#F8FAFC', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
             {testStyles}
             {warningOverlay}
             {/* Left Panel - 40% */}
             <div style={{ width: '40%', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
                 <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{test.title}</h2>
                     <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '12px' }}>⏱ {test.duration_minutes}:00</div>
                 </div>
                 <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#0f172a' }}>
                     {p ? (
                        <>
                           <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '22px', fontWeight: 800 }}>{currentProblemIndex + 1}. {p.title}</h3>
                           <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                               <span style={{ fontSize: '12px', background: 'rgba(245, 180, 0, 0.1)', color: '#f5b400', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Coding</span>
                               <span style={{ fontSize: '12px', background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Marks: {p.marks}</span>
                           </div>
                           <p style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '15px', marginBottom: '32px' }}>{p.description}</p>
                           
                           {p.input_format && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#0f172a', margin: '0 0 12px', fontSize: '15px', fontWeight: 700 }}>Input Format</h4>
                                 <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#0f172a', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>{p.input_format}</div>
                             </div>
                           )}
                           
                           {p.output_format && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#0f172a', margin: '0 0 12px', fontSize: '15px', fontWeight: 700 }}>Output Format</h4>
                                 <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#0f172a', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>{p.output_format}</div>
                             </div>
                           )}
      
                           {p.sample_input && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#0f172a', margin: '0 0 12px', fontSize: '15px', fontWeight: 700 }}>Sample Input</h4>
                                 <pre style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', margin: 0, border: '1px solid #e2e8f0' }}><code style={{ color: '#0f172a', fontSize: '14px', fontFamily: 'monospace' }}>{p.sample_input}</code></pre>
                             </div>
                           )}
      
                           {p.sample_output && (
                             <div style={{ marginBottom: '32px' }}>
                                 <h4 style={{ color: '#0f172a', margin: '0 0 12px', fontSize: '15px', fontWeight: 700 }}>Sample Output</h4>
                                 <pre style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', margin: 0, border: '1px solid #e2e8f0' }}><code style={{ color: '#0f172a', fontSize: '14px', fontFamily: 'monospace' }}>{p.sample_output}</code></pre>
                             </div>
                           )}
                        </>
                     ) : (
                        <p style={{ color: '#94a3b8' }}>No active problem found.</p>
                     )}
                 </div>
                 <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#FAFAFA', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', gap: '8px' }}>
                         <button 
                            style={{ padding: '10px 20px', background: currentProblemIndex === 0 ? '#f1f5f9' : '#0f172a', color: currentProblemIndex === 0 ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', cursor: currentProblemIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', boxShadow: currentProblemIndex === 0 ? 'none' : '0 2px 4px rgba(15,23,42,0.1)' }}
                            disabled={currentProblemIndex === 0}
                            onClick={() => setCurrentProblemIndex(i => i - 1)}
                         >Previous</button>
                         <button 
                            style={{ padding: '10px 20px', background: currentProblemIndex === (test.problems?.length - 1) ? '#f1f5f9' : '#0f172a', color: currentProblemIndex === (test.problems?.length - 1) ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', cursor: currentProblemIndex === (test.problems?.length - 1) ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', boxShadow: currentProblemIndex === (test.problems?.length - 1) ? 'none' : '0 2px 4px rgba(15,23,42,0.1)' }}
                            disabled={currentProblemIndex === (test.problems?.length - 1)}
                            onClick={() => setCurrentProblemIndex(i => i + 1)}
                         >Next Problem</button>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, padding: '4px 12px', background: '#e2e8f0', borderRadius: '12px' }}>
                           {currentProblemIndex + 1} / {test.problems?.length || 0}
                        </span>
                     </div>
                 </div>
             </div>

             {/* Right Panel - 60% */}
             <div style={{ width: '60%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
                 {/* Top: Code Editor (70%) */}
                 <div style={{ height: '70%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e2e8f0', background: '#1e293b' }}>
                      <div style={{ padding: '12px 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                             <div style={{ color: '#0f172a', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '6px' }}>main.py</div>
                             <select style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer', transition: '0.2s', fontWeight: 500 }}>
                                 <option>Python 3</option>
                                 <option>Java</option>
                                 <option>C++</option>
                                 <option>JavaScript</option>
                             </select>
                         </div>
                         <button onClick={() => alert('Code execution environment not yet initialized')} style={{ padding: '8px 20px', background: '#f8fafc', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: '0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.1)' }}>
                             ► Run Code
                         </button>
                      </div>
                      <textarea 
                           style={{ flex: 1, padding: '24px', background: '#1e293b', color: '#f8fafc', border: 'none', outline: 'none', fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace', fontSize: '15px', resize: 'none', lineHeight: '1.6' }}
                           placeholder="# Write your Python 3 code here..."
                           spellCheck={false}
                           defaultValue={`def solution():\n    # TODO: Implement your solution here\n    pass\n\nif __name__ == '__main__':\n    solution()`}
                      />
                 </div>
                 
                 {/* Bottom: Console (30%) */}
                 <div style={{ height: '30%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
                      <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>Test Case Output</span>
                             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                         </div>
                         <button onClick={handleManualSubmit} style={{ padding: '8px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}>
                             Submit Assessment
                         </button>
                      </div>
                      <div style={{ padding: '16px 24px', overflowY: 'auto', fontFamily: '"Fira Code", Consolas, monospace', color: '#334155', fontSize: '14px', flex: 1 }}>
                          <div style={{ marginBottom: '16px', color: '#64748b', fontWeight: 600 }}>$ environment connected. awaiting execution...</div>
                          <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a', fontWeight: 500 }}>
                              <span style={{ color: '#0284c7' }}>Info:</span> You must run the code to see test case results.
                          </div>
                      </div>
                 </div>
             </div>
        </div>
      );
  }

  // ====== QUIZ TEST LAYOUT (DEFAULT) ======
  return (
    <div className="fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0f172a', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {testStyles}
      {warningOverlay}

      <header className="runner-header" style={{ background: '#0f172a', padding: '20px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '13px', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{test?.test_type?.toUpperCase()} TEST</h2>
          <h1 style={{ margin: '4px 0 0', fontSize: '24px', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.5px' }}>{test?.title}</h1>
        </div>
        <div className="runner-timer" style={{ background: '#1e293b', color: '#fef08a', border: '1px solid #334155' }}>
           ⏱ {test?.duration_minutes}:00
        </div>
      </header>

      <main style={{ padding: '40px 32px', flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {test?.questions?.length > 0 ? (
          test.questions.map((q: any) => (
            <div key={q.id || q.question_number} className="question-card">
              <h3 style={{ marginTop: 0, fontSize: '18px', lineHeight: '1.5', color: '#0f172a' }}>
                <span style={{ color: '#f5b400', marginRight: '8px' }}>Q{q.question_number}.</span> {q.question_text}
              </h3>
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <label key={opt} className="mcq-option">
                    <input type="radio" name={`question-${q.id || q.question_number}`} value={opt} />
                    <span style={{ fontSize: '16px', lineHeight: '1.5' }}>{q[`option_${opt}`]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ marginTop: '24px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '48px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>No questions available for this test.</p>
          </div>
        )}
      </main>

      <footer style={{ padding: '20px 32px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, zIndex: 10, boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
         <button className="test-btn-runner" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }} onClick={handleManualSubmit}>
            Submit Assessment
         </button>
      </footer>
    </div>
  );
};

export default TestRunner;
