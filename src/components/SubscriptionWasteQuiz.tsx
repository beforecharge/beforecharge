import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

type QuizStep = "intro" | "question1" | "question2" | "question3" | "loading" | "results";

interface QuizData {
  estimatedCount: number;
  selectedCategories: string[];
  freeTrialAnswer: string;
}

const CATEGORIES = [
  { emoji: "🎬", label: "Streaming" },
  { emoji: "🎵", label: "Music" },
  { emoji: "☁️", label: "Cloud storage" },
  { emoji: "💪", label: "Fitness" },
  { emoji: "📰", label: "News" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🛠️", label: "Work tools" },
  { emoji: "🤖", label: "AI tools" },
  { emoji: "📚", label: "Learning" },
];

const LOADING_MESSAGES = [
  "Checking average spend for your profile...",
  "Comparing with 12,847 similar users...",
  "Calculating your estimated waste...",
];

export const SubscriptionWasteQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<QuizStep>("intro");
  const [quizData, setQuizData] = useState<QuizData>({
    estimatedCount: 0,
    selectedCategories: [],
    freeTrialAnswer: "",
  });
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  // Fade in intro text word by word
  useEffect(() => {
    if (step === "intro") {
      setTimeout(() => setFadeIn(true), 100);
    }
  }, [step]);

  // Loading screen message rotation
  useEffect(() => {
    if (step === "loading") {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1000);

      // Move to results after 3 seconds
      const timeout = setTimeout(() => {
        setStep("results");
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step]);

  const calculateResults = () => {
    // Base calculation
    let actualCount = 7; // Base
    let monthlySpend = 85;
    let forgottenCount = 2;

    // Add based on estimated count
    if (quizData.estimatedCount === 1) {
      actualCount = 14;
      monthlySpend = 127;
      forgottenCount = 4;
    } else if (quizData.estimatedCount === 2) {
      actualCount = 11;
      monthlySpend = 98;
      forgottenCount = 3;
    } else if (quizData.estimatedCount === 3) {
      actualCount = 18;
      monthlySpend = 165;
      forgottenCount = 5;
    }

    // Add for categories
    actualCount += quizData.selectedCategories.length;
    monthlySpend += quizData.selectedCategories.length * 12;
    forgottenCount += Math.floor(quizData.selectedCategories.length * 0.3);

    // Add for free trials
    if (quizData.freeTrialAnswer === "once") {
      forgottenCount += 1;
      monthlySpend += 11;
    } else if (quizData.freeTrialAnswer === "yes") {
      forgottenCount += 2;
      monthlySpend += 23;
    } else if (quizData.freeTrialAnswer === "dont-ask") {
      forgottenCount += 3;
      monthlySpend += 35;
    }

    const annualWaste = forgottenCount * 85;

    return {
      actualCount,
      estimatedCount: quizData.estimatedCount === 0 ? 7 : [3, 5, 8, 12][quizData.estimatedCount],
      monthlySpend,
      annualWaste,
      forgottenCount,
    };
  };

  const results = step === "results" ? calculateResults() : null;

  const toggleCategory = (label: string) => {
    setQuizData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(label)
        ? prev.selectedCategories.filter((c) => c !== label)
        : [...prev.selectedCategories, label],
    }));
  };

  return (
    <div className="subscription-waste-quiz">
      {/* Intro Screen */}
      {step === "intro" && (
        <div className={`quiz-screen ${fadeIn ? "fade-in" : ""}`}>
          <div className="quiz-intro">
            <p className="quiz-stat">The average person pays for 12 subscriptions.</p>
            <p className="quiz-stat delay-1">They think they pay for 7.</p>
            <p className="quiz-stat delay-2">
              The other 5 are quietly draining their account every single month.
            </p>
            <button
              className="quiz-btn-primary"
              onClick={() => setStep("question1")}
            >
              Am I one of them?
            </button>
          </div>
        </div>
      )}

      {/* Question 1 */}
      {step === "question1" && (
        <div className="quiz-screen fade-in">
          <div className="quiz-question">
            <p className="quiz-prompt">
              Quick — <span className="highlight">without checking</span> — how many subscriptions do you think you pay for?
            </p>
            <div className="quiz-options">
              {[
                { value: 0, label: "1–3" },
                { value: 1, label: "4–6" },
                { value: 2, label: "7–10" },
                { value: 3, label: "10+" },
              ].map((option) => (
                <button
                  key={option.value}
                  className="quiz-option"
                  onClick={() => {
                    setQuizData({ ...quizData, estimatedCount: option.value });
                    setStep("question2");
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question 2 */}
      {step === "question2" && (
        <div className="quiz-screen fade-in">
          <div className="quiz-question">
            <p className="quiz-prompt">
              Which of these do you use? <span className="quiz-hint">(tap all that apply)</span>
            </p>
            <div className="quiz-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  className={`quiz-category ${
                    quizData.selectedCategories.includes(cat.label) ? "selected" : ""
                  }`}
                  onClick={() => toggleCategory(cat.label)}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <button
              className="quiz-btn-next"
              onClick={() => setStep("question3")}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Question 3 */}
      {step === "question3" && (
        <div className="quiz-screen fade-in">
          <div className="quiz-question">
            <p className="quiz-prompt">Be honest —</p>
            <p className="quiz-subprompt">
              Have you ever signed up for a free trial and forgotten to cancel it?
            </p>
            <div className="quiz-options">
              {[
                { value: "never", label: "Never" },
                { value: "once", label: "Maybe once" },
                { value: "yes", label: "...yes" },
                { value: "dont-ask", label: "Don't ask" },
              ].map((option) => (
                <button
                  key={option.value}
                  className="quiz-option"
                  onClick={() => {
                    setQuizData({ ...quizData, freeTrialAnswer: option.value });
                    setStep("loading");
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {step === "loading" && (
        <div className="quiz-screen fade-in">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">{LOADING_MESSAGES[loadingMessageIndex]}</p>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {step === "results" && results && (
        <div className="quiz-screen fade-in">
          <div className="quiz-results">
            <p className="results-header">Based on your profile:</p>
            
            <div className="results-grid">
              <div className="result-card main">
                <div className="result-label">You're probably paying for</div>
                <div className="result-value-large">{results.actualCount}</div>
                <div className="result-sublabel">subscriptions</div>
              </div>

              <div className="result-card">
                <div className="result-label">You think you're paying for</div>
                <div className="result-value">{results.estimatedCount}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Your estimated monthly spend</div>
                <div className="result-value">${results.monthlySpend}/month</div>
              </div>

              <div className="result-card waste">
                <div className="result-label">Your estimated annual waste</div>
                <div className="result-value-waste">${results.annualWaste}/year</div>
              </div>
            </div>

            <div className="results-comparison">
              <p className="comparison-text">
                You are <span className="highlight">above average</span>.
              </p>
              <p className="comparison-subtext">
                Most people your profile find {results.forgottenCount} forgotten subs.
              </p>
            </div>

            <div className="results-divider"></div>

            <div className="results-cta">
              <p className="cta-text">
                BeforeCharge finds them all in 30 seconds.
              </p>
              <p className="cta-subtext">
                It pays for itself if we find just one.
              </p>
              <div className="cta-buttons">
                <button
                  className="quiz-btn-primary"
                  onClick={() => navigate("/signup")}
                >
                  Find my forgotten subscriptions
                </button>
                <button
                  className="quiz-btn-secondary"
                  onClick={() => {
                    const element = document.getElementById("how");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  See the breakdown first
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Counter */}
      <div className="ambient-counter">
        <Sparkles className="counter-icon" />
        <span className="counter-text">
          BeforeCharge users have found{" "}
          <span className="counter-value">$2,847,392</span> in forgotten subscriptions
        </span>
      </div>
    </div>
  );
};
