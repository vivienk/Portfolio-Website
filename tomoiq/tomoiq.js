(function(){
  var root=document.documentElement;
  var themeButton=document.querySelector(".theme-toggle");
  function updateTheme(){
    var light=root.dataset.theme==="light";
    themeButton.setAttribute("aria-pressed",String(light));
    themeButton.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");
    themeButton.textContent=light?"◐":"☼";
  }
  if(themeButton){updateTheme();themeButton.addEventListener("click",function(){root.dataset.theme=root.dataset.theme==="light"?"dark":"light";try{localStorage.setItem("theme",root.dataset.theme)}catch(e){}updateTheme()})}

  var flows=[
    ["01","Credit change","A credit event or question starts the flow.","Score, utilization, payment, or question.","A clear question to resolve."],
    ["02","Intent","Identify what the user needs to understand.","Intent, relevant factors, and freshness.","Only attributable context enters."],
    ["03","Retrieve data","Retrieve only verified context needed for the question.","Sources, factors, and data freshness.","Each claim has a source."],
    ["04","Rules","Rules calculate credit factors; AI never does.","Credit factors, eligibility, and policy.","Quantitative claims come from rules."],
    ["05","AI explanation","AI turns the result into plain language and flags uncertainty.","Completeness, claim checks, and timing.","A clear, grounded explanation."],
    ["06","Action","Offer the next step and record the outcome.","CTA relevance, feedback, and completed action.","One proportionate action—or no action."],
    ["07","Feedback","Capture whether the explanation was useful.","Ratings, follow-up questions, and completion.","A learning signal for the next release."]
  ];
  var flowButtons=[].slice.call(document.querySelectorAll("[data-flow]"));
  flowButtons.forEach(function(button){
    button.addEventListener("click",function(){
      var item=flows[Number(button.dataset.flow)];
      flowButtons.forEach(function(other){other.classList.toggle("active",other===button);other.setAttribute("aria-selected",String(other===button))});
      document.getElementById("flow-number").textContent=item[0];
      document.getElementById("flow-title").textContent=item[1];
      document.getElementById("flow-description").textContent=item[2];
      document.getElementById("flow-signal").textContent=item[3];
      document.getElementById("flow-metric").textContent=item[4];
    });
  });

  var operating=[
    ["01 · Understand","Identify the user’s question and credit event.","Intent · Data source · Freshness","What context is needed?","Retrieve only approved signals needed to answer.","Log intent, sources, and freshness."],
    ["02 · Decide","Answer, clarify, or escalate.","Rule owner · Policy boundary · Escalation","Who decides?","Rules—not the model—control amounts, eligibility, and risk.","Attach the rule and policy version."],
    ["03 · Use tools","Call the minimum approved tool.","Permission · Minimum scope · Tool status","What can it use?","Access only approved services tied to intent.","Log tool, scope, and result."],
    ["04 · Execute","Explain and propose a relevant action.","Autonomy level · Confirmation · Outcome","What runs automatically?","Consequential actions need confirmation or review.","Log explanation, action, and outcome."],
    ["05 · Recover","Recover clearly from incomplete or slow data.","Timeout · Data quality · Duplicate check","What happens when data fails?","Preserve context, limit uncertainty, and prevent duplicates.","Log failure and recovery."],
    ["06 · Verify","Confirm resolution—or explain why not.","Completion · User feedback · Follow-up","How do we know it helped?","Do not claim completion without observable proof.","Log completion, feedback, and unresolved needs."]
  ];
  var operatingButtons=[].slice.call(document.querySelectorAll("[data-operating]"));
  operatingButtons.forEach(function(button){
    button.addEventListener("click",function(){
      var item=operating[Number(button.dataset.operating)];
      operatingButtons.forEach(function(other){other.classList.toggle("active",other===button);other.setAttribute("aria-selected",String(other===button))});
      document.getElementById("operating-number").textContent=item[0];
      document.getElementById("operating-description").textContent=item[1];
      document.getElementById("operating-checks").textContent=item[2];
      document.getElementById("operating-question").textContent=item[3];
      document.getElementById("operating-guardrail").textContent=item[4];
      document.getElementById("operating-proof").textContent=item[5];
    });
  });

  var journey=[
    {stage:"Credit change",before:["A score changes without a clear cause.","A bureau update appears as a number.","Score movement triggered “why?” questions.","Numbers without causes create anxiety.","Lead with cause, not delta.","Human-readable summary."],after:["Sees the change, cause, and urgency.","The event opens a contextual explanation.","Urgency is clear before detail.","Meaning arrives with the number.","Show change, cause, and urgency together.","Faster orientation."],friction:true},
    {stage:"Intent",before:["Searches broadly or contacts support.","Generic content loads without a clear goal.","One score change can imply several needs.","Answer quality depends on intent.","Offer clear intents.","A bounded question."],after:["Chooses the question they need.","Intent guides retrieval and response.","The conversation starts with a boundary.","Small choices make AI controllable.","Use suggested prompts and free-form input.","Purposeful conversations."],friction:true},
    {stage:"Retrieve data",before:["Repeats context or gets generic advice.","Credit and product data are separate.","Generic answers missed the actual change.","Personalization needs complete retrieval.","Retrieve only factors needed for intent.","Scoped context."],after:["Gets an account-grounded explanation.","Verified data includes source and freshness.","Personal claims trace to a factor.","Trust starts with evidence.","Keep context minimal and current.","Traceable personalization."],friction:true},
    {stage:"Rules",before:["Cannot tell education from advice.","Policy boundaries vary across content.","High-stakes topics needed clearer limits.","Fluency can look like certainty.","Apply rules before generation.","Explicit boundaries."],after:["Gets a clear, bounded explanation.","Rules check eligibility, uncertainty, and escalation.","Risk is handled before wording.","The model explains policy; it does not invent it.","Separate rules from generated language.","Safer answers."],friction:true},
    {stage:"AI explanation",before:["Reads dense credit language.","The model lacks a consistent explanation pattern.","Existing explanations were intimidating.","Correct information can still confuse.","Explain what changed, why, and what next.","Repeatable pattern."],after:["Gets a concise, causal explanation.","The model uses a constrained template.","The prototype explains before persuading.","Consistency builds trust.","Pair plain language with evidence.","Explainable AI."],friction:true},
    {stage:"Action",before:["Understands more but decides alone.","Education and actions are disconnected.","Information rarely became a next step.","Explanation without agency leaves anxiety.","Offer one action—or recommend no action.","Focused next step."],after:["Chooses a small, relevant next step.","Actions rank by intent, impact, and effort.","Advice stays specific without overload.","A good recommendation can be to wait.","Use one primary action with rationale.","Insight to action."],friction:true},
    {stage:"Feedback",before:["Leaves without correcting the answer.","Engagement cannot show usefulness.","Completion did not prove understanding.","AI quality needs a learning signal.","Capture usefulness, questions, and actions.","Learning loop."],after:["Can rate, question, or flag the answer.","Feedback records answer context.","Qualitative and behavioral feedback combine.","Correction builds trust.","Make feedback lightweight and specific.","121% conversion increase."],friction:false}
  ];
  var stageButtons=[].slice.call(document.querySelectorAll("[data-stage]"));
  var currentStage=0,currentMode="before",currentView="user";
  var modeButtons=[].slice.call(document.querySelectorAll("[data-mode]"));
  var viewButtons=[].slice.call(document.querySelectorAll("[data-view]"));
  function renderJourney(){
    var item=journey[currentStage],state=item[currentMode],isSystem=currentView==="system";
    stageButtons.forEach(function(button,index){button.classList.toggle("active",index===currentStage);button.setAttribute("aria-selected",String(index===currentStage))});
    document.getElementById("journey-stage-number").textContent=("0"+(currentStage+1)).slice(-2);
    document.getElementById("journey-stage-title").textContent=item.stage;
    document.getElementById("journey-perspective-label").textContent=isSystem?"System view":"User view";
    document.getElementById("journey-perspective").textContent=isSystem?state[1]:state[0];
    document.getElementById("journey-system").textContent=state[1];
    document.getElementById("journey-signal").textContent=state[2];
    document.getElementById("journey-interpretation").textContent=state[3];
    document.getElementById("journey-decision").textContent=state[4];
    document.getElementById("journey-proof").textContent=state[5];
  }
  stageButtons.forEach(function(button){button.classList.toggle("friction-stage",journey[Number(button.dataset.stage)].friction);button.addEventListener("click",function(){currentStage=Number(button.dataset.stage);renderJourney()})});
  modeButtons.forEach(function(button){button.addEventListener("click",function(){currentMode=button.dataset.mode;modeButtons.forEach(function(other){other.classList.toggle("active",other===button)});renderJourney()})});
  viewButtons.forEach(function(button){button.addEventListener("click",function(){currentView=button.dataset.view;viewButtons.forEach(function(other){other.classList.toggle("active",other===button)});renderJourney()})});
  var friction=document.querySelector(".friction"),stageRail=document.querySelector(".journey-stages");
  if(friction){friction.addEventListener("click",function(){var on=friction.getAttribute("aria-pressed")!=="true";friction.setAttribute("aria-pressed",String(on));stageRail.classList.toggle("friction-on",on)})}
})();
