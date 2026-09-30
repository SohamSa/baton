import { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { EXECUTIVE_QUESTIONS } from "./ExecutivePortfolioView";

interface ExecutiveQAViewProps {
  onPlayRehearsal?: (storyId: string) => void;
  playing?: boolean;
}

export function ExecutiveQAView({
  onPlayRehearsal,
  playing = false,
}: ExecutiveQAViewProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["gradual_warning", "abrupt_failure"]) // Start with top 2 open for immediate reading pleasure
  );

  const categories = [
    { id: "all", label: "All Questions (17)", icon: "📚" },
    { id: "cooling", label: "High-Rise Cooling (3)", icon: "❄️" },
    { id: "power", label: "Power & Grid (2)", icon: "⚡" },
    { id: "board", label: "Hardware & Boards (3)", icon: "🔌" },
    { id: "silicon", label: "Silicon & Batches (2)", icon: "🏭" },
    { id: "ai", label: "Software & Guardrails (2)", icon: "🤖" },
    { id: "sync", label: "Cluster Sync & Stalls (5)", icon: "🏃" },
  ];

  const filteredQuestions = useMemo(() => {
    return EXECUTIVE_QUESTIONS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.analogyTitle.toLowerCase().includes(q) ||
        item.plainEnglish.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const allExpanded = filteredQuestions.length > 0 && filteredQuestions.every((q) => expandedIds.has(q.id));

  function toggleAll() {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  }

  function toggleCard(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleRehearse(storyId: string) {
    if (onPlayRehearsal) {
      onPlayRehearsal(storyId);
    } else {
      navigate(`/desk?scenario=${storyId}`);
    }
  }

  return (
    <section className="qa-lounge-container">
      {/* 1. WELCOMING EXECUTIVE HEADER */}
      <header className="qa-lounge-header">
        <div className="qa-lounge-eyebrow-row">
          <span className="eyebrow">💡 Executive Knowledge Lounge</span>
          <span className="qa-count-badge">17 Plain-English Answers</span>
        </div>
        <h1>17 Hardware Questions Every Datacenter Owner Asks</h1>
        <p className="lede">
          Running an AI datacenter shouldn't require an advanced degree in semiconductor physics.
          Every question below was asked by real-world datacenter founders, investors, and facility owners.
          Click any card to explore the plain-English explanation, the real-world analogy, and the bottom-line financial impact.
        </p>
      </header>

      {/* 2. SEARCH & TOPIC BAR (UNCLUTTERED & INTUITIVE) */}
      <div className="qa-controls-card panel">
        <div className="qa-search-row">
          <div className="qa-search-input-wrap">
            <span className="qa-search-icon">🔍</span>
            <input
              type="search"
              className="qa-search-input"
              placeholder="Search by topic, question, or analogy (e.g. cooling, car engine, bakery, screws, power surge)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search questions"
            />
            {searchQuery ? (
              <button
                type="button"
                className="qa-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="qa-controls-actions">
            <button
              type="button"
              className="qa-toggle-all-btn"
              onClick={toggleAll}
            >
              {allExpanded ? "▲ Collapse All" : "▼ Expand All"}
            </button>
            <span className="qa-result-count">
              Showing {filteredQuestions.length} of {EXECUTIVE_QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="qa-category-scroll-bar" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`qa-topic-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. THE 17 UNCLUTTERED, PLEASURABLE Q&A CARDS */}
      <div className="qa-cards-flow">
        {filteredQuestions.length === 0 ? (
          <div className="qa-empty-state panel">
            <div className="empty-icon">🔍</div>
            <h3>No matching questions found</h3>
            <p className="muted">
              We couldn't find any questions matching "{searchQuery}". Try searching for words like "cooling", "power", "solder", or "stall".
            </p>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((qa, index) => {
            const isExpanded = expandedIds.has(qa.id);
            return (
              <article
                key={qa.id}
                className={`qa-pleasure-card ${isExpanded ? "expanded" : ""}`}
              >
                {/* Clean, Clickable Card Header */}
                <div
                  className="qa-card-clickable-header"
                  onClick={() => toggleCard(qa.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCard(qa.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="qa-card-header-main">
                    <div className="qa-card-meta-line">
                      <span className="qa-num-badge">Q{index + 1}</span>
                      <span className="qa-cat-pill">{qa.categoryLabel}</span>
                    </div>

                    <h2 className="qa-card-question-title">{qa.question}</h2>

                    {/* Warm, friendly analogy bar */}
                    <div className="qa-analogy-preview">
                      <span className="analogy-icon">{qa.analogyIcon}</span>
                      <span className="analogy-prefix">Analogy:</span>
                      <strong className="analogy-text">{qa.analogyTitle}</strong>
                    </div>
                  </div>

                  <div className="qa-expand-chevron" aria-hidden="true">
                    <span>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded Pleasant Reading Body */}
                {isExpanded ? (
                  <div className="qa-card-reading-body">
                    {/* Plain English Story */}
                    <div className="qa-reading-section">
                      <div className="section-pill-tag">📖 In Plain English</div>
                      <p className="qa-plain-text">{qa.plainEnglish}</p>
                    </div>

                    {/* How Continuity Solves It */}
                    <div className="qa-reading-section">
                      <div className="section-pill-tag tag-solution">🛡️ How Baton Solves It</div>
                      <p className="qa-plain-text">{qa.solution}</p>
                    </div>

                    {/* Financial Takeaway & Simulator Action */}
                    <div className="qa-bottom-summary-box">
                      <div className="qa-dollars-impact">
                        <span className="impact-label">💰 Bottom-Line Impact:</span>
                        <strong className="impact-text">{qa.financialImpact}</strong>
                      </div>

                      <div className="qa-card-actions">
                        <button
                          type="button"
                          className="qa-simulator-btn"
                          onClick={() => handleRehearse(qa.id)}
                          disabled={playing}
                        >
                          {playing ? "⏳ Simulating…" : "⚡ Try This in Live Simulator"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      {/* 4. PLEASURABLE BOTTOM NAVIGATION FOOTER */}
      <footer className="qa-lounge-footer panel">
        <div>
          <h3>Want to test these scenarios in real time?</h3>
          <p className="muted">
            The Live Practice Floor lets you play out these situations step-by-step across all 32,768 chips.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <NavLink to="/desk" className="hero-primary-btn" style={{ textDecoration: "none" }}>
            ⚡ Open Live Practice Floor
          </NavLink>
          <NavLink to="/" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
            🌟 Return to Executive Portfolio
          </NavLink>
        </div>
      </footer>
    </section>
  );
}
