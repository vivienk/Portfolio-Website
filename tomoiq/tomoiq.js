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

  const dialogueTraces = [
    {
      question: "Why did my score change?",
      response: "I’ll explain the confirmed factor before suggesting a next step.",
      branch: "Credit event · known intent",
      branchDetail: "A verified credit event gives the conversation a high-confidence starting point.",
      inputs: ["TransUnion credit event", "Credit-report API", "Data freshness", "Factor-ranking rule"],
      modes: ["Explain"],
      modeDetail: "Explain cause, impact, and one relevant next step—without inventing an unverified reason.",
      safety: "Use a focused, reassuring tone. If the event or factor cannot be verified, ask before explaining.",
      uiTitle: "Causal explanation",
      uiDetail: "Plain language explains the confirmed change, with a visible report source.",
      cta: "View credit report",
    },
    {
      question: "What is this derogatory mark?",
      response: "I can explain the term once I know which report item you’re looking at.",
      branch: "Support Q&A · missing context",
      branchDetail: "The term alone is ambiguous; TomoIQ retrieves the exact item rather than inferring one.",
      inputs: ["Selected report item", "Local Q&A definition", "Credit-bureau label", "Record date"],
      modes: ["Clarify"],
      modeDetail: "Use a maintained local answer when possible; otherwise ask for the smallest missing detail before generating.",
      safety: "Keep the explanation short. When a dispute or identity decision is implied, show the official path rather than deciding for the user.",
      uiTitle: "Source disclosure",
      uiDetail: "The report item and its definition stay together, with a safe route to the next step.",
      cta: "Review report item",
    },
    {
      question: "What should I do next?",
      response: "I can suggest a low-risk next step based on the factor that changed.",
      branch: "Capital access or cash flow · high risk",
      branchDetail: "A recommendation may affect money, eligibility, or a dispute decision—so the response is bounded.",
      inputs: ["Plaid cash-flow API", "TomoScore risk model", "Policy version", "Action-risk rule"],
      modes: ["Constrain", "Escalate"],
      modeDetail: "Offer only a proportionate, user-controlled action. Escalate when confirmation or a regulated decision is required.",
      safety: "Give one action at a time. No payment, dispute, or eligibility outcome is generated without policy, confirmation, or human review.",
      uiTitle: "Safe limitation",
      uiDetail: "A bounded recommendation explains what TomoIQ can do now and where it must hand off.",
      cta: "Explore relevant options",
    },
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

  const dialogueTrace = document.querySelector(".dialogueTrace");
  const prototype = document.querySelector(".tomoPrototype");
  if (dialogueTrace && prototype) {
    dialogueTrace.classList.add("prototypeTrace");
    prototype.querySelector(".phoneGallery")?.after(dialogueTrace);
    text("dialogue-trace-title", "Prompt design in the prototype");
    const traceEyebrow = dialogueTrace.querySelector(".dialogueTraceHeading .eyebrow");
    if (traceEyebrow) traceEyebrow.textContent = "Prompt engineering · Prototype interaction";
    const traceIntro = dialogueTrace.querySelector(".dialogueTraceHeading > p:last-child");
    if (traceIntro) traceIntro.textContent = "The prototype made the decision path tangible: classify the question, retrieve only useful context, then present one focused response.";
    const topicRail = document.createElement("div");
    topicRail.className = "promptTopicRail";
    topicRail.setAttribute("aria-label", "Prompt topics covered");
    topicRail.innerHTML = "<span>Credit events</span><span>Capital access</span><span>Cash flow</span><span>Support Q&amp;A</span>";
    dialogueTrace.querySelector(".dialogueTraceHeading")?.after(topicRail);
  }

  const processNavigation = document.querySelector(".roleDisciplines");
  const processChallenge = document.getElementById("challenge");
  if (processNavigation && processChallenge) {
    const processLinks = [...processNavigation.querySelectorAll("a[href^='#']")];
    const processSections = processLinks.map((link) => ({
      link,
      section: document.querySelector(link.getAttribute("href")),
    })).filter(({ section }) => section);
    const setProcessSection = (id) => {
      processSections.forEach(({ link, section }) => {
        const active = section.id === id;
        link.classList.toggle("isActive", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const updateProcessNavigation = () => {
      const revealAt = window.scrollY + window.innerHeight * .36;
      processNavigation.classList.toggle("isVisible", revealAt >= processChallenge.offsetTop);
      let activeId = processSections[0]?.section.id;
      processSections.forEach(({ section }) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * .42) activeId = section.id;
      });
      if (activeId) setProcessSection(activeId);
    };
    let processFrame;
    const queueProcessUpdate = () => {
      if (processFrame) return;
      processFrame = requestAnimationFrame(() => {
        processFrame = undefined;
        updateProcessNavigation();
      });
    };
    processLinks.forEach((link) => link.addEventListener("click", () => setProcessSection(link.hash.slice(1))));
    window.addEventListener("scroll", queueProcessUpdate, { passive: true });
    window.addEventListener("resize", queueProcessUpdate);
    updateProcessNavigation();
  }

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

  const dialogueButtons = [...document.querySelectorAll("[data-dialogue]")];
  const renderDialogue = (index) => {
    const trace = dialogueTraces[index];
    if (!trace) return;
    dialogueButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("isActive", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const panel = document.getElementById("dialogue-panel");
    if (panel && dialogueButtons[index]) panel.setAttribute("aria-labelledby", dialogueButtons[index].id);
    text("dialogue-question", trace.question);
    text("dialogue-response", trace.response);
    text("dialogue-branch", trace.branch);
    text("dialogue-branch-detail", trace.branchDetail);
    text("dialogue-mode-detail", trace.modeDetail);
    text("dialogue-safety", trace.safety);
    text("dialogue-ui-title", trace.uiTitle);
    text("dialogue-ui-detail", trace.uiDetail);
    text("dialogue-ui-cta", trace.cta);
    const inputs = document.getElementById("dialogue-inputs");
    if (inputs) inputs.replaceChildren(...trace.inputs.map((label) => { const item = document.createElement("li"); item.textContent = label; return item; }));
    document.querySelectorAll("[data-dialogue-mode]").forEach((mode) => mode.classList.toggle("isActive", trace.modes.includes(mode.dataset.dialogueMode)));
  };
  dialogueButtons.forEach((button, index) => {
    button.addEventListener("click", () => renderDialogue(index));
    button.addEventListener("keydown", (event) => moveWithKeys(event, dialogueButtons, index, renderDialogue));
  });
  renderDialogue(0);

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
