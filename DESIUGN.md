<html lang="en" class="h-full"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nexus Finance - Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
@keyframes fadeInUp {
from { opacity: 0; transform: translateY(30px); }
to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
from { opacity: 0; transform: translateX(-30px); }
to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
from { opacity: 0; transform: translateX(30px); }
to { opacity: 1; transform: translateX(0); }
}
@keyframes slideDown {
from { opacity: 0; transform: translateY(-20px); }
to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
from { opacity: 0; transform: scale(0.8); }
to { opacity: 1; transform: scale(1); }
}
@keyframes pulse {
0%, 100% { transform: scale(1); }
50% { transform: scale(1.05); }
}
@keyframes shimmer {
0% { background-position: -1000px 0; }
100% { background-position: 1000px 0; }
}
@keyframes float {
0%, 100% { transform: translateY(0px); }
50% { transform: translateY(-10px); }
}
@keyframes glow {
0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
.animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
.animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
.animate-slide-down { animation: slideDown 0.6s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
.animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-glow { animation: glow 4s ease-in-out infinite; }
.shimmer {
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
background-size: 200% 100%;
animation: shimmer 2s infinite;
}
.opacity-0 { opacity: 0; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }
.delay-700 { animation-delay: 0.7s; }
.delay-800 { animation-delay: 0.8s; }
.delay-900 { animation-delay: 0.9s; }
.delay-1000 { animation-delay: 1s; }
.delay-1100 { animation-delay: 1.1s; }
.delay-1200 { animation-delay: 1.2s; }
.delay-1300 { animation-delay: 1.3s; }
.delay-1400 { animation-delay: 1.4s; }
.delay-1500 { animation-delay: 1.5s; }
.gradient-border {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
padding: 1px;
border-radius: 1rem;
}
.gradient-bg {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.glass-effect {
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
}
.number-counter {
font-variant-numeric: tabular-nums;
}
</style><link id="all-fonts-link-font-geist" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-geist">.font-geist { font-family: 'Geist', sans-serif !important; }</style><link id="all-fonts-link-font-roboto" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-roboto">.font-roboto { font-family: 'Roboto', sans-serif !important; }</style><link id="all-fonts-link-font-montserrat" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-montserrat">.font-montserrat { font-family: 'Montserrat', sans-serif !important; }</style><link id="all-fonts-link-font-poppins" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-poppins">.font-poppins { font-family: 'Poppins', sans-serif !important; }</style><link id="all-fonts-link-font-playfair" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&amp;display=swap"><style id="all-fonts-style-font-playfair">.font-playfair { font-family: 'Playfair Display', serif !important; }</style><link id="all-fonts-link-font-instrument-serif" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-instrument-serif">.font-instrument-serif { font-family: 'Instrument Serif', serif !important; }</style><link id="all-fonts-link-font-merriweather" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&amp;display=swap"><style id="all-fonts-style-font-merriweather">.font-merriweather { font-family: 'Merriweather', serif !important; }</style><link id="all-fonts-link-font-bricolage" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-bricolage">.font-bricolage { font-family: 'Bricolage Grotesque', sans-serif !important; }</style><link id="all-fonts-link-font-jakarta" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&amp;display=swap"><style id="all-fonts-style-font-jakarta">.font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }</style><link id="all-fonts-link-font-manrope" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&amp;display=swap"><style id="all-fonts-style-font-manrope">.font-manrope { font-family: 'Manrope', sans-serif !important; }</style><link id="all-fonts-link-font-space-grotesk" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-space-grotesk">.font-space-grotesk { font-family: 'Space Grotesk', sans-serif !important; }</style><link id="all-fonts-link-font-work-sans" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&amp;display=swap"><style id="all-fonts-style-font-work-sans">.font-work-sans { font-family: 'Work Sans', sans-serif !important; }</style><link id="all-fonts-link-font-pt-serif" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&amp;display=swap"><style id="all-fonts-style-font-pt-serif">.font-pt-serif { font-family: 'PT Serif', serif !important; }</style><link id="all-fonts-link-font-geist-mono" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-geist-mono">.font-geist-mono { font-family: 'Geist Mono', monospace !important; }</style><link id="all-fonts-link-font-space-mono" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&amp;display=swap"><style id="all-fonts-style-font-space-mono">.font-space-mono { font-family: 'Space Mono', monospace !important; }</style><link id="all-fonts-link-font-quicksand" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-quicksand">.font-quicksand { font-family: 'Quicksand', sans-serif !important; }</style><link id="all-fonts-link-font-nunito" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&amp;display=swap"><style id="all-fonts-style-font-nunito">.font-nunito { font-family: 'Nunito', sans-serif !important; }</style></head>
<body class="font-inter h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

<!-- Animated Background Elements -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
  <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-20 animate-float"></div>
  <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 animate-float" style="animation-delay: -3s;"></div>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-10 animate-pulse-slow"></div>
</div>

<!-- Sidebar -->
<aside class="opacity-0 animate-fade-in-left fixed z-30 inset-y-0 left-0 w-16 md:w-20 glass-effect flex flex-col transition-all duration-500 hover:shadow-2xl hover:w-20 md:hover:w-24 border-r pt-6 pb-6 shadow-2xl items-center">
  <div class="flex flex-col space-y-8">
    <div class="transition-all duration-300 cursor-pointer hover:text-indigo-700 animate-glow text-indigo-600">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm tracking-tight bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 font-sans" style="transition: outline 0.1s ease-in-out;">NX</div>
    </div>
    <button class="p-3 rounded-xl transition-all duration-300 group text-gray-400 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="home" class="lucide lucide-home w-5 h-5" style="stroke-width: 1.5"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" class=""></path></svg>
    </button>
    <button class="p-3 rounded-xl transition-all duration-300 text-indigo-600 bg-white/80 shadow-lg backdrop-blur-sm transform scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="bar-chart-3" class="lucide lucide-bar-chart-3 w-5 h-5" style="stroke-width: 1.5"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
    </button>
    <button class="p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="users" class="lucide lucide-users w-5 h-5" style="stroke-width: 1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
    </button>
    <button class="p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="credit-card" class="lucide lucide-credit-card w-5 h-5" style="stroke-width: 1.5"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
    </button>
    <button class="p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="file-text" class="lucide lucide-file-text w-5 h-5" style="stroke-width: 1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
    </button>
  </div>
  <div class="mt-auto">
    <button class="p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="settings" class="lucide lucide-settings w-5 h-5" style="stroke-width: 1.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
  </div>
</aside>

<!-- Main Content -->
<main class="md:ml-20 min-h-screen ml-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <!-- Header -->
    <header class="opacity-0 animate-slide-down delay-100 flex flex-col lg:flex-row lg:items-center justify-between mb-10">
      <div>
        <h1 class="text-3xl lg:text-4xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 font-manrope font-semibold" style="">Good morning, Marcus ✨</h1>
        <button class="flex items-center text-gray-500 group transition-all duration-300 hover:text-gray-700">
          <span class="text-base font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Your weekly financial overview</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="chevron-down" class="lucide lucide-chevron-down w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-300" style="stroke-width: 1.5"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
      </div>
      <div class="flex items-center space-x-4 mt-6 lg:mt-0">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="search" class="lucide lucide-search absolute left-4 top-3.5 w-5 h-5 text-gray-400" style="stroke-width: 1.5"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
          <input type="text" placeholder="Search transactions..." class="pl-12 pr-4 py-3 w-72 rounded-2xl border-0 glass-effect shadow-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300 placeholder-gray-400">
        </div>
        <button class="p-3 rounded-2xl glass-effect shadow-lg hover:shadow-xl transition-all duration-300 relative group transform hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="bell" class="lucide lucide-bell w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" style="stroke-width: 1.5"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse-slow shadow-lg"></div>
        </button>
        <div class="flex items-center space-x-3 glass-effect px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/6653564f-d2bb-4c35-8fef-be58ac89ffe0_320w.jpg" alt="Marcus Chen" class="w-12 h-12 object-cover border-white border-2 rounded-xl shadow-md">
          <div class="hidden md:block">
            <p class="text-sm font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">Marcus Chen</p>
            <p class="text-xs text-gray-500 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Chief Financial Officer</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Financial Overview Cards -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-8">
        <h2 class="opacity-0 animate-fade-in-up delay-200 text-2xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-manrope font-semibold" style="">Financial Overview</h2>
        <button class="opacity-0 animate-fade-in-up delay-200 text-gray-500 flex items-center space-x-2 glass-effect px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
          <span class="text-sm font-medium font-sans" style="transition: outline 0.1s ease-in-out;">This month</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="chevron-down" class="lucide lucide-chevron-down w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" style="stroke-width: 1.5"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="opacity-0 animate-scale-in delay-300 relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div class="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow font-sans" style="transition: outline 0.1s ease-in-out;">+28%</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trending-up" class="lucide lucide-trending-up w-6 h-6 text-white" style="stroke-width: 1.5"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
          </div>
          <p class="text-sm text-gray-500 mb-3 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Total Revenue</p>
          <p class="text-3xl mb-2 text-gray-900 number-counter font-manrope font-semibold" data-target="847293" style="">$186,404</p>
          <p class="text-xs text-gray-400 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">+$23,105 from last month</p>
        </div>

        <div class="opacity-0 animate-scale-in delay-400 relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div class="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow font-sans" style="transition: outline 0.1s ease-in-out;">+15%</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="file-check" class="lucide lucide-file-check w-6 h-6 text-white" style="stroke-width: 1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path></svg>
          </div>
          <p class="text-sm text-gray-500 mb-3 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Pending Approvals</p>
          <p class="text-3xl mb-2 text-gray-900 number-counter font-manrope font-semibold" data-target="127" style="">27</p>
          <p class="text-xs text-gray-400 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">18 approved today</p>
        </div>

        <div class="opacity-0 animate-scale-in delay-500 relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div class="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow font-sans" style="transition: outline 0.1s ease-in-out;">-8%</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="x-circle" class="lucide lucide-x-circle w-6 h-6 text-white" style="stroke-width: 1.5"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
          </div>
          <p class="text-sm text-gray-500 mb-3 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Rejected Claims</p>
          <p class="text-3xl mb-2 text-gray-900 number-counter font-manrope font-semibold" data-target="23" style="">5</p>
          <p class="text-xs text-gray-400 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">3 rejected this week</p>
        </div>

        <div class="opacity-0 animate-scale-in delay-600 relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div class="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow font-sans" style="transition: outline 0.1s ease-in-out;">+12%</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="clock" class="lucide lucide-clock w-6 h-6 text-white" style="stroke-width: 1.5"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
          </div>
          <p class="text-sm text-gray-500 mb-3 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Under Review</p>
          <p class="text-3xl mb-2 text-gray-900 number-counter font-manrope font-semibold" data-target="94" style="">20</p>
          <p class="text-xs text-gray-400 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Average 2.3 days</p>
        </div>

        <div class="opacity-0 animate-scale-in delay-700 relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20">
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div class="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow font-sans" style="transition: outline 0.1s ease-in-out;">+35%</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="check-circle" class="lucide lucide-check-circle w-6 h-6 text-white" style="stroke-width: 1.5"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
          </div>
          <p class="text-sm text-gray-500 mb-3 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Completed</p><p class="text-3xl mb-2 text-gray-900 number-counter font-manrope font-semibold" data-target="1456" style="">320</p>
          <p class="text-xs text-gray-400 font-medium font-sans" style="transition: outline 0.1s ease-in-out;">+412 this month</p>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
      <!-- Revenue Chart -->
      <div class="opacity-0 animate-fade-in-up delay-800 xl:col-span-2 glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 font-sans" style="transition: outline 0.1s ease-in-out;">Revenue Analytics</h3>
            <p class="text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Monthly performance overview</p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="text-xs font-medium px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 font-sans" style="transition: outline 0.1s ease-in-out;">6M</button>
            <button class="text-xs font-medium px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all duration-300 font-sans" style="transition: outline 0.1s ease-in-out;">1Y</button>
          </div>
        </div>
        <div class="h-80">
          <canvas id="revenueChart" width="1468" height="640" style="display: block; box-sizing: border-box; height: 320px; width: 734px;"></canvas>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="opacity-0 animate-fade-in-right delay-900 glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20">
        <h3 class="text-xl font-bold text-gray-900 mb-6 font-sans" style="transition: outline 0.1s ease-in-out;">Quick Actions</h3>
        <div class="space-y-4">
          <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </div>
              <span class="font-medium font-sans" style="transition: outline 0.1s ease-in-out;">New Invoice</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
          
          <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path></svg>
              </div>
              <span class="font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Export Report</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
          
          <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
              </div>
              <span class="font-medium font-sans" style="transition: outline 0.1s ease-in-out;">Team Analytics</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
        
        <div class="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <h4 class="font-semibold text-gray-900 mb-3 font-sans" style="transition: outline 0.1s ease-in-out;">Recent Activity</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <p class="text-sm text-gray-600 font-sans" style="transition: outline 0.1s ease-in-out;">Invoice #1847 approved</p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <p class="text-sm text-gray-600 font-sans" style="transition: outline 0.1s ease-in-out;">New client onboarded</p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 rounded-full bg-amber-500"></div>
              <p class="text-sm text-gray-600 font-sans" style="transition: outline 0.1s ease-in-out;">Payment pending review</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <section class="opacity-0 animate-fade-in-up delay-1000">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-manrope font-semibold" style="">Recent Transactions</h2>
        <button class="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-2 transition-all duration-300 group">
          <span class="font-sans" style="transition: outline 0.1s ease-in-out;">View all</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
      
      <div class="glass-effect rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-8 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans" style="transition: outline 0.1s ease-in-out;">Transaction</th>
                <th class="px-6 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans" style="transition: outline 0.1s ease-in-out;">Amount</th>
                <th class="px-6 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans" style="transition: outline 0.1s ease-in-out;">Status</th>
                <th class="px-6 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans" style="transition: outline 0.1s ease-in-out;">Date</th>
                <th class="px-8 py-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans" style="transition: outline 0.1s ease-in-out;">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50/50 transition-all duration-300">
                <td class="px-8 py-6">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right text-white"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">Office Supplies</p>
                      <p class="text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Staples Inc.</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">-$2,847.50</td>
                <td class="px-6 py-6">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-sans" style="transition: outline 0.1s ease-in-out;">Completed</span>
                </td>
                <td class="px-6 py-6 text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Oct 15, 2024</td>
                <td class="px-8 py-6 text-right">
                  <button class="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </td>
              </tr>
              <tr class="hover:bg-gray-50/50 transition-all duration-300">
                <td class="px-8 py-6">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right text-white"><path d="m7 17 10-10"></path><path d="M7 7h10v10"></path></svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">Client Payment</p>
                      <p class="text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Acme Corporation</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 font-semibold text-green-600 font-sans" style="transition: outline 0.1s ease-in-out;">+$15,750.00</td>
                <td class="px-6 py-6">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-sans" style="transition: outline 0.1s ease-in-out;">Completed</span>
                </td>
                <td class="px-6 py-6 text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Oct 14, 2024</td>
                <td class="px-8 py-6 text-right">
                  <button class="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </td>
              </tr>
              <tr class="hover:bg-gray-50/50 transition-all duration-300">
                <td class="px-8 py-6">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock text-white"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">Software License</p>
                      <p class="text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Adobe Systems</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 font-semibold text-gray-900 font-sans" style="transition: outline 0.1s ease-in-out;">-$4,200.00</td>
                <td class="px-6 py-6">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 font-sans" style="transition: outline 0.1s ease-in-out;">Pending</span>
                </td>
                <td class="px-6 py-6 text-sm text-gray-500 font-sans" style="transition: outline 0.1s ease-in-out;">Oct 13, 2024</td>
                <td class="px-8 py-6 text-right">
                  <button class="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</main>

<script>
  // Initialize Chart.js
  const ctx = document.getElementById('revenueChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [65000, 78000, 85000, 92000, 88000, 94000],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // Counter animation
  function animateCounters() {
    const counters = document.querySelectorAll('.number-counter');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const increment = target / 100;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = counter.textContent.includes('$') ? `$${target.toLocaleString()}` : target.toLocaleString();
          clearInterval(timer);
        } else {
          counter.textContent = counter.textContent.includes('$') ? `$${Math.floor(current).toLocaleString()}` : Math.floor(current).toLocaleString();
        }
      }, 20);
    });
  }

  // Initialize animations on page load
  window.addEventListener('load', () => {
    setTimeout(animateCounters, 1000);
  });
</script>


</body></html>