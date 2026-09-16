(() => {
  const flow = [
    ["01", "User question or credit event", "A credit event or question starts the flow.", "Score, utilization, payment, or question.", "A clear question to resolve."],
    ["02", "Identify intent and retrieve data", "Identify the question and retrieve verified context.", "Intent, relevant factors, and freshness.", "Only attributable context enters."],
    ["03", "Apply credit rules", "Rules calculate credit factors; AI never does.", "Credit factors, eligibility, and policy.", "Quantitative claims come from rules."],
    ["04", "Generate and check explanation", "AI turns the result into plain language and flags uncertainty.", "Completeness, claim checks, and timing.", "A clear, grounded explanation."],
    ["05", "Show action and record outcome", "Offer the next step and record the outcome.", "CTA relevance, feedback, and completed action.", "One proportionate action—or no action."],
  ];

  const agentStages = [
    ["01 · Understand", "Identify the user’s question and credit event.", "What context is needed?", "Retrieve only approved signals needed to answer.", "Log intent, sources, and freshness.", ["Intent", "Data source", "Freshness"]],
    ["02 · Decide", "Answer, clarify, or escalate.", "Who decides?", "Rules—not the model—control amounts, eligibility, and risk.", "Attach the rule and policy version.", ["Rule owner", "Policy boundary", "Escalation"]],
    ["03 · Use tools", "Call the minimum approved tool.", "What can it use?", "Access only approved services tied to intent.", "Log tool, scope, and result.", ["Permission", "Minimum scope", "Tool status"]],
    ["04 · Execute", "Explain and propose a relevant action.", "What runs automatically?", "Consequential actions need confirmation or review.", "Log explanation, action, and outcome.", ["Autonomy level", "Confirmation", "Outcome"]],
    ["05 · Recover", "Recover clearly from incomplete or slow data.", "What happens when data fails?", "Preserve context, limit uncertainty, and prevent duplicates.", "Log failure and recovery.", ["Timeout", "Data quality", "Duplicate check"]],
    ["06 · Verify", "Confirm resolution—or explain why not.", "What proves completion?", "Link source, rule, explanation, action, and outcome.", "Keep an auditable event record.", ["Completion rule", "Audit trail", "Human review"]],
  ];

  const journey = [
    ["Credit change", "A number changes without meaning", true, ["A score changes without a clear cause.", "A bureau update appears as a number.", "Score movement triggered ‘why?’ questions.", "Numbers without causes create anxiety.", "Lead with cause, not delta.", "Human-readable summary"], ["Sees the change, cause, and urgency.", "The event opens a contextual explanation.", "Urgency is clear before detail.", "Meaning arrives with the number.", "Show change, cause, and urgency together.", "Faster orientation"]],
    ["Intent", "The system guesses the question", true, ["Searches broadly or contacts support.", "Generic content loads without a clear goal.", "One score change can imply several needs.", "Answer quality depends on intent.", "Offer clear intents.", "A bounded question"], ["Chooses the question they need.", "Intent guides retrieval and response.", "The conversation starts with a boundary.", "Small choices make AI controllable.", "Use suggested prompts and free-form input.", "Purposeful conversations"]],
    ["Retrieve data", "Context is fragmented", true, ["Repeats context or gets generic advice.", "Credit and product data are separate.", "Generic answers missed the actual change.", "Personalization needs complete retrieval.", "Retrieve only factors needed for intent.", "Scoped context"], ["Gets an account-grounded explanation.", "Verified data includes source and freshness.", "Personal claims trace to a factor.", "Trust starts with evidence.", "Keep context minimal and current.", "Traceable personalization"]],
    ["Rules", "Guardrails are implicit", true, ["Cannot tell education from advice.", "Policy boundaries vary across content.", "High-stakes topics needed clearer limits.", "Fluency can look like certainty.", "Apply rules before generation.", "Explicit boundaries"], ["Gets a clear, bounded explanation.", "Rules check eligibility, uncertainty, and escalation.", "Risk is handled before wording.", "The model explains policy; it does not invent it.", "Separate rules from generated language.", "Safer answers"]],
    ["AI explanation", "Dense language obscures cause", true, ["Reads dense credit language.", "The model lacks a consistent explanation pattern.", "Existing explanations were intimidating.", "Correct information can still confuse.", "Explain what changed, why, and what next.", "Repeatable pattern"], ["Gets a concise, causal explanation.", "The model uses a constrained template.", "The prototype explains before persuading.", "Consistency builds trust.", "Pair plain language with evidence.", "Explainable AI"]],
    ["Action", "Education ends without direction", true, ["Understands more but decides alone.", "Education and actions are disconnected.", "Information rarely became a next step.", "Explanation without agency leaves anxiety.", "Offer one action—or recommend no action.", "Focused next step"], ["Chooses a small, relevant next step.", "Actions rank by intent, impact, and effort.", "Advice stays specific without overload.", "A good recommendation can be to wait.", "Use one primary action with rationale.", "Insight to action"]],
    ["Feedback", "Answer quality is a blind spot", false, ["Leaves without correcting the answer.", "Engagement cannot show usefulness.", "Completion did not prove understanding.", "AI quality needs a learning signal.", "Capture usefulness, questions, and actions.", "Learning loop"], ["Can rate, question, or flag the answer.", "Feedback records answer context.", "Qualitative and behavioral feedback combine.", "Correction builds trust.", "Make feedback lightweight and specific.", "121% conversion increase"]],
  ];

  const text = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  const moveWithKeys = (event, buttons, index, onMove) => {
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = (index + direction + buttons.length) % buttons.length;
    onMove(next);
    requestAnimationFrame(() => buttons[next].focus());
  };

  const flowButtons = [...document.querySelectorAll("[data-flow]")];
  const selectFlow = (index) => {
    const item = flow[index];
    flowButtons.forEach((button, buttonIndex) => { const active = buttonIndex === index; button.classList.toggle("isActive", active); button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1; });
    text("flow-number", item[0]); text("flow-title", item[1]); text("flow-description", item[2]); text("flow-signal", item[3]); text("flow-metric", item[4]);
  };
  flowButtons.forEach((button, index) => { button.addEventListener("click", () => selectFlow(index)); button.addEventListener("keydown", (event) => moveWithKeys(event, flowButtons, index, selectFlow)); });

  const agentButtons = [...document.querySelectorAll("[data-agent]")];
  const selectAgent = (index) => {
    const item = agentStages[index];
    agentButtons.forEach((button, buttonIndex) => { const active = buttonIndex === index; button.classList.toggle("isActive", active); button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1; });
    text("agent-number", item[0]); text("agent-description", item[1]); text("agent-question", item[2]); text("agent-guardrail", item[3]); text("agent-proof", item[4]);
    const checks = document.getElementById("agent-checks");
    if (checks) { checks.replaceChildren(...item[5].map((label) => { const tag = document.createElement("em"); tag.textContent = label; return tag; })); }
  };
  agentButtons.forEach((button, index) => { button.addEventListener("click", () => selectAgent(index)); button.addEventListener("keydown", (event) => moveWithKeys(event, agentButtons, index, selectAgent)); });

  const rail = document.querySelector(".journeyRail");
  const journeySection = document.querySelector(".journeySection");
  let journeyIndex = 0;
  let journeyMode = "before";
  let journeyView = "user";
  const renderJourney = () => {
    const item = journey[journeyIndex];
    const state = item[journeyMode === "before" ? 3 : 4];
    const perspective = journeyView === "user" ? state[0] : state[1];
    const stageButtons = [...document.querySelectorAll("[data-stage]")];
    stageButtons.forEach((button, index) => { const active = index === journeyIndex; button.classList.toggle("isActive", active); button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1; });
    text("journey-number", `${String(journeyIndex + 1).padStart(2, "0")} / ${String(journey.length).padStart(2, "0")}`);
    text("journey-phase", journeyMode === "before" ? "Observed journey" : "Designed journey");
    text("journey-title-detail", item[0]);
    text("journey-perspective-label", journeyView === "user" ? "What the user experiences" : "What the system does");
    text("journey-perspective", perspective); text("journey-signal", state[2]); text("journey-interpretation", state[3]); text("journey-decision", state[4]); text("journey-proof", state[5]);
  };
  if (rail) {
    journey.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button"; button.role = "tab"; button.dataset.stage = String(index); button.tabIndex = index === 0 ? 0 : -1;
      if (index === 0) button.classList.add("isActive"); if (item[2]) button.classList.add("hasFriction");
      const number = document.createElement("span"); number.className = "stageIndex"; number.textContent = String(index + 1).padStart(2, "0");
      const dot = document.createElement("b"); dot.setAttribute("aria-hidden", "true");
      const title = document.createElement("strong"); title.textContent = item[0];
      const signal = document.createElement("small"); signal.textContent = item[1];
      button.append(number, dot, title, signal); rail.append(button);
      button.addEventListener("click", () => { journeyIndex = index; renderJourney(); });
      button.addEventListener("keydown", (event) => moveWithKeys(event, [...document.querySelectorAll("[data-stage]")], index, (next) => { journeyIndex = next; renderJourney(); }));
    });
  }
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { journeyMode = button.dataset.mode; document.querySelectorAll("[data-mode]").forEach((node) => { const active = node === button; node.classList.toggle("isActive", active); node.setAttribute("aria-pressed", String(active)); }); renderJourney(); }));
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { journeyView = button.dataset.view; document.querySelectorAll("[data-view]").forEach((node) => { const active = node === button; node.classList.toggle("isActive", active); node.setAttribute("aria-pressed", String(active)); }); renderJourney(); }));
  const friction = document.querySelector(".frictionToggle");
  friction?.addEventListener("click", () => { const active = friction.getAttribute("aria-pressed") !== "true"; friction.setAttribute("aria-pressed", String(active)); journeySection?.classList.toggle("isFriction", active); });
  renderJourney();
})();
