import React, { useState } from 'react';

interface Props {
  testType: 'Quiz' | 'Code';
  testTitle: string;
  onStart: () => void;
  onClose: () => void;
}

const TestInstructionsModal: React.FC<Props> = ({ testType, testTitle, onStart, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <style>{`
        .student-nav { display: none !important; }
        .student-page-content { padding: 0 !important; max-width: 100% !important; }
        .btn-yellow {
          background: #f5b400; color: #0f172a; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(245, 180, 0, 0.4); font-size: 15px;
        }
        .btn-yellow:hover:not(:disabled) {
          transform: scale(1.02) translateY(-1px);
          box-shadow: 0 6px 20px 0 rgba(245, 180, 0, 0.6);
          filter: brightness(1.1);
        }
        .btn-yellow:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-cancel {
          background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 15px;
        }
        .btn-cancel:hover {
          background: #f8fafc;
          transform: scale(1.02) translateY(-1px);
        }
        .instruction-checkbox {
          display: flex; align-items: center; gap: 16px; margin-top: 32px; cursor: pointer; background: #ffffff; padding: 20px 24px; border-radius: 12px; border: 2px solid #e2e8f0; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); color: #0f172a; position: relative;
        }
        .instruction-checkbox:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .instruction-checkbox:has(input:checked) {
          border-color: #0f172a;
          background: #f8fafc;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
        }
        .instruction-checkbox input[type="checkbox"] {
          appearance: none;
          width: 24px;
          height: 24px;
          border: 2px solid #cbd5e1;
          border-radius: 6px;
          margin: 0;
          cursor: pointer;
          display: grid;
          place-content: center;
          transition: all 0.2s ease;
        }
        .instruction-checkbox input[type="checkbox"]::before {
          content: "✓";
          font-size: 16px;
          font-weight: 800;
          color: white;
          transform: scale(0);
          transition: 0.2s transform cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .instruction-checkbox:has(input:checked) input[type="checkbox"] {
          background: #0f172a;
          border-color: #0f172a;
        }
        .instruction-checkbox:has(input:checked) input[type="checkbox"]::before {
          transform: scale(1);
        }
      `}</style>
      <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="modal-content" style={{ background: '#ffffff', color: '#0f172a', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxWidth: '600px', width: '90%', padding: '40px', overflow: 'hidden' }}>
          <h2 style={{ background: '#0f172a', color: '#ffffff', margin: '-40px -40px 24px -40px', padding: '24px 40px', fontSize: '26px', fontWeight: 800 }}>
            {testType} Instructions: <span style={{ color: '#f5b400' }}>{testTitle}</span>
          </h2>
          
          <div style={{color: '#334155', fontSize: '16px', marginTop: '24px', lineHeight: '1.6'}}>
            <p style={{ background: 'rgba(245, 180, 0, 0.15)', borderLeft: '4px solid #f5b400', padding: '16px', borderRadius: '6px', fontWeight: 600, color: '#0f172a' }}>
              Candidates must not engage in any form of malpractice during the test. Any violation will lead to immediate disqualification.
            </p>
            
            <ul className="instructions-list" style={{ paddingLeft: '24px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'transparent', border: 'none' }}>
              <li style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Tab switching is strictly limited.</strong> You are allowed a maximum of two tab switches. Exceeding this limit will result in elimination from the test.</li>
              <li style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>You must remain in full-screen mode throughout the test.</strong> Exiting full-screen mode more than twice will lead to elimination.</li>
            </ul>
          </div>
          
          <label className="instruction-checkbox">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
            />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
              I understand the rules and regulations and am ready to attend the test.
            </span>
          </label>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn-yellow" 
              disabled={!agreed} 
              onClick={onStart}
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestInstructionsModal;
