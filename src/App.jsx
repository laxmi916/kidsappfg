

import { useState } from "react";
import "./App.css";

window.speechSynthesis.onvoiceschanged = () => {
  console.log("Available voices:", window.speechSynthesis.getVoices());
};

function App() {
  const [mode, setMode] = useState("");
  const [story, setStory] = useState("");
  const [translated, setTranslated] = useState("");
  const [dailyRoutine, setDailyRoutine] = useState("");
  const [age, setAge] = useState(6);
  const [topic, setTopic] = useState("");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});

  // Math state
  const [mathProblems, setMathProblems] = useState([]);
  const [mathAnswers, setMathAnswers] = useState({});
  const [mathScore, setMathScore] = useState(null);
  const [operation, setOperation] = useState("addition");

  const API_BASE = "https://kids-learning-backend-eryf.onrender.com";
  //const API_BASE = "https://kidsappbg.onrender.com"

  const callAPI = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  };

  const speakText = (text, lang = "en-US") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Story ---
  const getStory = async () => {
    setMode("Story");
    const data = await callAPI("story", { age, topic });
    setStory(data.story);
    setTranslated("");
    setQuiz(null);
    setScore(null);
    setAnswers({});
    setCorrectAnswers({});
    setDailyRoutine("");
    speakText(data.story);
  };

    // --- Translate for Story ---
    const translateToTelugu = async () => {
    if (!story) return;
    const data = await callAPI("translate", { text: story });
    setTranslated(data.translated);
    speakText(data.translated, "te-IN"); // optional: read in Telugu
    };

    // --- Translate for Daily Routine ---
    const translateDailyToTelugu = async () => {
    if (!dailyRoutine) return;
    const data = await callAPI("translate", { text: dailyRoutine });
    setTranslated(data.translated);
    speakText(data.translated, "te-IN");
    };


  // --- Daily Routine ---
  const getDailyRoutine = async () => {
    const data = await callAPI("words", { age });
    setDailyRoutine(data.words);
    setMode("DailyRoutine");
    setStory("");
    setQuiz(null);
    setScore(null);
    setAnswers({});
    setCorrectAnswers({});
    setTranslated("");
  };

  // --- Quiz ---
  const getQuiz = async () => {
    if (!story) return;
    setMode("Quiz");
    const data = await callAPI("quiz", { story });
    setQuiz({ quizId: data.quizId, questions: data.questions });
    setAnswers({});
    setScore(null);

    const correctMap = {};
    data.questions.forEach((q, idx) => (correctMap[idx] = q.answer));
    setCorrectAnswers(correctMap);
  };

  const selectAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const submitQuiz = () => {
    if (!quiz) return;
    let scoreCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === correctAnswers[idx]) scoreCount++;
    });
    setScore(scoreCount);
  };

  // --- Math ---
  const getMathProblems = async () => {
    const data = await callAPI("math", { age, operation });
    setMathProblems(data.problems);
    setMathAnswers({});
    setMathScore(null);
    setMode("Math");
    setStory("");
    setQuiz(null);
    setScore(null);
    setAnswers({});
    setCorrectAnswers({});
    setDailyRoutine("");
  };

  const handleMathAnswerChange = (idx, value) => {
    setMathAnswers({ ...mathAnswers, [idx]: value });
  };

  const submitMath = () => {
    let scoreCount = 0;
    mathProblems.forEach((p, idx) => {
      if (Number(mathAnswers[idx]) === p.answer) scoreCount++;
    });
    setMathScore(scoreCount);
  };

  return (
    <div className="app">
      <h2 className="title">🌟 Kids Learning 🌟</h2>

      <div style={{ marginBottom: "16px" }}>
        Age: <input
          type="number"
          min="4"
          max="12"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Enter age"
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic"
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="addition">Addition</option>
          <option value="subtraction">Subtraction</option>
          <option value="multiplication">Multiplication</option>
          <option value="division">Division</option>
        </select>
      </div>

      <div className="button-grid">
        <button className="btn btn-blue" onClick={getStory}>
          📖 Story
        </button>
        <button className="btn btn-green" onClick={getQuiz} disabled={!story}>
          🎲 Quiz
        </button>
        <button className="btn btn-purple" onClick={getDailyRoutine}>
          📅 Daily Routine
        </button>
        <button className="btn btn-orange" onClick={getMathProblems}>
          🧮 Math Problems
        </button>
      </div>

      {/* Story */}
        {/* Story */}
        {mode === "Story" && story && (
        <div className="result-box card card-blue">
            <h2>📖 Story</h2>

            <div style={{ marginBottom: "16px" }}>
            {story.split(/(?<=[.!?])\s+/).map((para, pIdx) => (
                <p key={pIdx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
                {para.split(" ").map((word, wIdx) => {
                    const spellWord = word.split("").join(" ").replace(/[^a-zA-Z]/g, "");
                    return (
                    <span
                        key={wIdx}
                        onMouseEnter={() => speakText(spellWord)}
                        style={{
                        marginRight: "6px",
                        cursor: "pointer",
                        display: "inline-block",
                        }}
                        title={`Spell: ${word}`}
                    >
                        {word}
                    </span>
                    );
                })}
                </p>
            ))}
            </div>

            <button onClick={() => speakText(story)}>🔊 Read Full Story</button>
            <button onClick={translateToTelugu} style={{ marginLeft: "8px" }}>
            🌐 Translate to Telugu
            </button>

            {translated && (
            <div className="result-box card card-green" style={{ marginTop: "16px" }}>
                <h3>🌐 తెలుగు అనువాదం</h3>
                    <div style={{ marginBottom: "12px" }}>
                    {translated.split(/(?<=[.!?])\s+/).map((para, idx) => (
                        <p key={idx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
                        {para}
                        </p>
                    ))}
                    </div>
                {/*
                <p style={{ lineHeight: "1.6" }}>{translated}</p>
                <button onClick={() => speakText(translated, "te-IN")}>
                🔊 Read Telugu
                </button> */}
            </div>
            )}
        </div>
        )}



      {/* Daily Routine 
      {mode === "DailyRoutine" && dailyRoutine && (
        <div className="result-box card card-green">
          <h2>📅 Daily Routine</h2>
          <p>{dailyRoutine}</p>
        </div>
      )}  
     */}

     {/* Daily Routine */}
    {mode === "DailyRoutine" && dailyRoutine && (
    <div className="result-box card card-blue">
        <h2>📅 Daily Routine</h2>

        {/* English Paragraphs with word hover + spelling */}
        <div style={{ marginBottom: "12px" }}>
        {dailyRoutine.split(/(?<=[.!?])\s+/).map((para, pIdx) => (
            <p key={pIdx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
            {para.split(" ").map((word, wIdx) => {
                const spellWord = word
                .split("")
                .join(" ")
                .replace(/[^a-zA-Z]/g, ""); // spell letters only
                return (
                <span
                    key={wIdx}
                    onMouseEnter={() => speakText(spellWord)}
                    style={{
                    marginRight: "6px",
                    cursor: "pointer",
                    display: "inline-block",
                    }}
                    title={`Spell: ${word}`}
                >
                    {word}
                </span>
                );
            })}
            </p>
        ))}
        </div>


        <button onClick={() => speakText(dailyRoutine)}>🔊 Read dailyRoutine</button>
        {/* Button to translate */}
        <button onClick={translateDailyToTelugu} style={{ marginLeft: "8px" }}>
        🌐 Translate to Telugu
        </button>


        {/* Telugu Paragraphs */}
            {translated && (
            <div className="result-box card card-green" style={{ marginTop: "16px" }}>
                <h3>🌐 తెలుగు అనువాదం</h3>
                    <div style={{ marginBottom: "12px" }}>
                    {translated.split(/(?<=[.!?])\s+/).map((para, idx) => (
                        <p key={idx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
                        {para}
                        </p>
                    ))}
                    </div>
            </div>
            )}
    </div>
    )}


      {/* Quiz */}
      {mode === "Quiz" && quiz && (
        <div className="result-box card card-yellow">
          <h2>🎲 Quiz</h2>
          {quiz.questions.map((q, idx) => (
            <div key={idx} className="quiz-question" style={{ marginBottom: "16px" }}>
              <p>
                <strong>
                  {idx + 1}. {q.question}
                </strong>
              </p>
              {q.options.map((opt, oIdx) => {
                let color = "black";
                if (score !== null) {
                  if (opt === correctAnswers[idx]) color = "green";
                  else if (answers[idx] === opt) color = "red";
                }
                return (
                  <label key={oIdx} style={{ display: "block", color }}>
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => selectAnswer(idx, opt)}
                      disabled={score !== null}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          ))}
          {score === null ? (
            <button className="btn btn-blue" onClick={submitQuiz}>
              ✅ Submit Quiz
            </button>
          ) : (
            <h3>
              ⭐ Your Score: {score}/{quiz.questions.length}
            </h3>
          )}
        </div>
      )}

      {/* Math */}
      {mode === "Math" && mathProblems.length > 0 && (
  <div className="result-box card card-orange">
    <h2>🧮 Math Problems ({operation})</h2>
    {mathProblems.map((p, idx) => {
      let color = "black";
      let symbol = "";
      if (mathScore !== null) {
        if (Number(mathAnswers[idx]) === p.answer) {
          color = "green";
          symbol = " ✅";
        } else {
          color = "red";
          symbol = ` ❌ (Correct: ${p.answer})`;
        }
      }

      // Split numbers from question
      let [num1, num2] = p.question.split(/[\+\-\*\/=]/).map((n) => n.trim());

      return (
        <div key={idx} style={{ marginBottom: "20px", color, fontFamily: "monospace" }}>
          <strong>{idx + 1}.</strong>
          <div style={{ textAlign: "right", fontSize: "20px", lineHeight: "1.6" }}>
            <div>{num1}</div>
            <div>
              {p.question.includes("+") && "+"}
              {p.question.includes("-") && "-"}
              {p.question.includes("*") && "×"}
              {p.question.includes("/") && "÷"} {num2}
            </div>
            <div style={{ borderTop: "2px solid black", width: "7ch", marginTop: "4px" }}>
              <input
                type="number"
                value={mathAnswers[idx] || ""}
                onChange={(e) => handleMathAnswerChange(idx, e.target.value)}
                style={{
                  padding: "6px",
                  width: "100px",
                  fontSize: "18px",
                  textAlign: "center",
                  border: "1px solid gray",
                  marginTop: "4px",
                }}
                disabled={mathScore !== null}
              />
            </div>
          </div>
          {symbol && <div style={{ marginTop: "4px" }}>{symbol}</div>}
        </div>
      );
    })}
    {mathScore === null ? (
      <button className="btn btn-orange" onClick={submitMath}>
        ✅ Submit Math
      </button>
    ) : (
      <h3>
        ⭐ Your Score: {mathScore}/{mathProblems.length}
      </h3>
    )}
  </div>
)}

    </div>
  );
}

export default App;
