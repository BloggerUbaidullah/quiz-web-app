import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Play, Trophy } from 'lucide-react';

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

const questions: Question[] = [
  {
    id: 1,
    text: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Cascading Style Sheets",
      "Colorful Style Sheets"
    ],
    correctAnswer: 2
  },
  {
    id: 2,
    text: "Which of the following is a JavaScript framework?",
    options: ["Django", "React", "Laravel", "Spring"],
    correctAnswer: 1
  },
  {
    id: 3,
    text: "What is the correct HTML element for inserting a line break?",
    options: ["<break>", "<lb>", "<br>", "<newline>"],
    correctAnswer: 2
  },
  {
    id: 4,
    text: "Which property is used to change the background color in CSS?",
    options: ["color", "bgcolor", "background-color", "bg-color"],
    correctAnswer: 2
  },
  {
    id: 5,
    text: "How do you write 'Hello World' in an alert box?",
    options: [
      "msgBox('Hello World');",
      "alertBox('Hello World');",
      "msg('Hello World');",
      "alert('Hello World');"
    ],
    correctAnswer: 3
  }
];

const TIME_PER_QUESTION = 15; // seconds

export default function App() {
  // state
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  
  // timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // If an answer is selected for the current question, pause the timer
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;

    if (timeLeft <= 0) {
      // Auto-submit wrong answer if time runs out
      handleAnswerSelect(-1); // -1 means no answer / timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, currentQuestionIndex, selectedAnswers]);

  const handleStart = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(TIME_PER_QUESTION);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // Prevent changing answer
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      setGameState('result');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // We don't reset timer when going back, or maybe we just show the selected answer
      // Since it's already answered, timer is paused anyway
    }
  };

  const handleRestart = () => {
    setGameState('start');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(TIME_PER_QUESTION);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
      <div className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Web Dev Quiz</h1>
              <p className="text-slate-500 mb-8 text-lg">Test your knowledge of HTML, CSS, and JavaScript. You have {TIME_PER_QUESTION} seconds per question.</p>
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
              >
                <Play size={20} fill="currentColor" />
                Start Quiz
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Header / Progress */}
              <div className="p-6 md:p-8 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${timeLeft <= 5 && !isAnswered ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                    <Timer size={16} />
                    {isAnswered ? '--' : `00:${timeLeft.toString().padStart(2, '0')}`}
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Area */}
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-tight">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index;
                    const isCorrect = currentQuestion.correctAnswer === index;
                    const showCorrect = isAnswered && isCorrect;
                    const showWrong = isAnswered && isSelected && !isCorrect;
                    
                    let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700";
                    if (showCorrect) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500";
                    } else if (showWrong) {
                      optionClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                    } else if (isAnswered) {
                      optionClass = "border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${optionClass}`}
                      >
                        <span className="text-lg font-medium">{option}</span>
                        {showCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
                        {showWrong && <XCircle className="text-red-500" size={24} />}
                        {!isAnswered && (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer / Navigation */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${!isAnswered ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5'}`}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
              <p className="text-slate-500 mb-8 text-lg">Here is how you did.</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 inline-block min-w-[200px]">
                <div className="text-5xl font-black text-indigo-600 mb-2">
                  {calculateScore()}<span className="text-2xl text-slate-400">/{questions.length}</span>
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Score</div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
                >
                  <RotateCcw size={20} />
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 text-center text-slate-400 text-sm font-medium tracking-wide">
        Design by ubaid ullah
      </div>
    </div>
  );
}
