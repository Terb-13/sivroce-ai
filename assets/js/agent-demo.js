// Intelligent Quoting & Scheduling Assistant Demo
(function () {
  const chat = document.getElementById('agent-chat');
  const input = document.getElementById('agent-input');
  const send = document.getElementById('agent-send');
  const audit = document.getElementById('agent-audit');
  if (!chat || !input) return;

  const auditLog = [];

  const RESPONSES = [
    {
      match: /order|status|po-|2847|2851|shipped|production/i,
      reply: 'PO-2847 (Apex Industrial Supply) is **In Production** — 2,400 bracket assemblies, due July 2. Proof was approved June 14. A FedEx Freight shipment is scheduled for July 5.\n\nPO-2851 (Midwest Packaging) is **Proof Pending** — revision requested on fold line adjustment. Design team is preparing v2.',
      reasoning: 'Queried order management index → matched 2 active POs for customer context → pulled status, proof, and shipment nodes from workflow graph.',
      sources: ['ERP Order Index', 'Proof Workflow', 'Shipping Scheduler'],
    },
    {
      match: /schedul|conflict|capacity|line|machine/i,
      reply: 'I found **2 scheduling conflicts** for next week:\n\n1. **CNC Line 3** — PO-2863 and PO-2847 overlap on July 1 (4.5 hrs over capacity). Recommend shifting PO-2863 start to July 2 AM.\n2. **Welding Cell B** — maintenance window conflicts with PO-2867. Suggest running PO-2867 on Cell A (12% slower but available).\n\n⚠️ These are recommendations — your production planner reviews and approves all schedule changes.',
      reasoning: 'Ran capacity model against committed POs → identified overlap on CNC Line 3 and Welding Cell B → generated ranked alternatives with utilization impact.',
      sources: ['MES Capacity Model', 'Maintenance Calendar', 'Production Schedule'],
    },
    {
      match: /quote|pricing|estimate|draft|bracket|corrugated/i,
      reply: 'Draft quote prepared for **custom bracket assembly** (2,400 units):\n\n• Material: 14ga HR steel — $1.42/unit\n• CNC machining + deburr: $2.18/unit\n• Powder coat (RAL 7035): $0.64/unit\n• Tooling amortization: $0.31/unit\n• **Suggested price: $5.85/unit** (32.4% margin)\n\nBased on 3 similar jobs from the last 90 days. Your estimator should review tolerances and finish spec before sending.',
      reasoning: 'Matched product category → pulled 3 comparable historical quotes → applied current material index + standard routing times → calculated margin against target band.',
      sources: ['Quote History DB', 'Material Price Index', 'Routing Standards'],
    },
    {
      match: /proof|revision|approval/i,
      reply: '**Proof pipeline summary:**\n\n• 3 proofs awaiting customer review\n• 1 revision in progress (PO-2851 — fold line)\n• Average approval cycle: 2.1 days (down from 4.2 days pre-AI routing)\n\nAll proof routing requires CS team confirmation before customer notification.',
      reasoning: 'Aggregated proof workflow states → calculated rolling average cycle time → flagged items requiring human approval gate.',
      sources: ['Proof Workflow Engine', 'CS Approval Queue'],
    },
    {
      match: /help|what can|how do/i,
      reply: 'I can help with:\n\n• **Order & proof status** — "What\'s the status of PO-2847?"\n• **Scheduling conflicts** — "Any capacity conflicts next week?"\n• **Quote drafting** — "Draft a quote for bracket assemblies"\n• **Proof pipeline** — "Show proof revisions pending"\n\nEvery response includes a full audit trail. Your team reviews and approves all actions before they take effect.',
      reasoning: 'Displayed capability map from agent configuration.',
      sources: ['Agent Config'],
    },
  ];

  const DEFAULT = {
    reply: 'I can look up order status, identify scheduling conflicts, draft quotes from historical data, or summarize your proof pipeline. Try asking about a specific PO, capacity next week, or quote drafting.\n\nRemember: I provide recommendations — your team always reviews and approves before anything goes to production or customers.',
    reasoning: 'No high-confidence intent match → returned capability guidance per agent guardrails.',
    sources: ['Agent Guardrails'],
  };

  function addAudit(entry) {
    auditLog.unshift(entry);
    if (audit) {
      audit.innerHTML = auditLog.slice(0, 8).map((e) => `
        <div class="text-xs border-b border-navy-100 pb-2 mb-2 last:border-0">
          <p class="text-navy-400">${e.time}</p>
          <p class="text-navy-700 font-medium mt-0.5">${e.intent}</p>
          <p class="text-navy-500 mt-0.5">${e.reasoning}</p>
        </div>`).join('');
    }
  }

  function addMessage(text, role, meta) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';
    const bubble = document.createElement('div');
    bubble.className = role === 'user'
      ? 'max-w-[85%] bg-navy text-white rounded-2xl rounded-br-md px-4 py-3 text-sm'
      : 'max-w-[85%] bg-white border border-navy-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-navy-700 shadow-soft';
    bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-navy-900">$1</strong>').replace(/\n/g, '<br>');
    div.appendChild(bubble);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    if (meta && role === 'assistant') {
      addAudit({ time: new Date().toLocaleTimeString(), intent: meta.intent, reasoning: meta.reasoning });
    }
  }

  function respond(query) {
    const match = RESPONSES.find((r) => r.match.test(query)) || DEFAULT;
    setTimeout(() => {
      addMessage(match.reply, 'assistant', { intent: query.slice(0, 60), reasoning: match.reasoning });
      if (match.sources) {
        const src = document.getElementById('agent-sources');
        if (src) src.textContent = 'Sources: ' + match.sources.join(' · ');
      }
    }, 400);
  }

  function handleSend() {
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, 'user');
    input.value = '';
    respond(q);
  }

  send?.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });

  document.querySelectorAll('[data-suggestion]').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.suggestion;
      handleSend();
    });
  });

  addMessage('Hello — I\'m your quoting & scheduling assistant. Ask about order status, capacity conflicts, or quote drafting. Every recommendation goes through your team for review and approval.', 'assistant', { intent: 'Greeting', reasoning: 'Initialized session with guardrail reminder.' });
})();