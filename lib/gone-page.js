export const GONE_MESSAGE = 'Sirvoce is now practical AI for manufacturers.';

export const GONE_HTML = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <meta name="description" content="${GONE_MESSAGE} Process-serving pages are gone." />
  <title>This page is gone — Sirvoce</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{navy:{DEFAULT:'#1F3A5F',50:'#F0F4F8',100:'#D9E2EC',200:'#BCCCDC',500:'#627D98',600:'#486581',800:'#243B53',900:'#1F3A5F',950:'#102A43'},teal:{DEFAULT:'#0D9488',50:'#F0FDFA',100:'#CCFBF1',600:'#0D9488',700:'#0F766E'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="font-sans text-navy-800 bg-white antialiased min-h-screen flex flex-col">
  <main class="flex-1 flex items-center justify-center px-4 py-20">
    <div class="max-w-xl text-center">
      <p class="text-teal font-semibold text-sm uppercase tracking-wider mb-3">410 — Gone</p>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mb-5">${GONE_MESSAGE}</h1>
      <p class="text-navy-600 leading-relaxed mb-8">This URL was part of an earlier legal / process-serving site. That work is no longer offered here. Sirvoce builds practitioner-led AI systems for mid-sized manufacturers — then trains your team and hands everything off.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-700">Go to the homepage</a>
        <a href="/engage" class="inline-flex items-center justify-center px-6 py-3 border border-navy-200 text-navy font-semibold rounded-lg hover:bg-navy-50">Book a strategy workshop</a>
      </div>
    </div>
  </main>
</body>
</html>
`;
