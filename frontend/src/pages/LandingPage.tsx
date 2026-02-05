import React, { useRef } from 'react';
import { ArrowRight, ChevronDown, ScanEye, Brain, FileText, Github, Minus, Plus, Lock, Server, Database, AlertTriangle, HardHat } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VideoPlayer from '../components/VideoPlayer';
import ErrorBoundary from '../components/ErrorBoundary';
import { Worker } from '../api';
import HowItWorks from '../components/HowItWorks';

const DEMO_WORKERS: Worker[] = [
  { id: 'WK-01', x: 20, y: 20, hasHelmet: true, hasVest: true, zone: 'Safe', status: 'Working', lastSeen: new Date().toISOString() },
  { id: 'WK-02', x: 70, y: 30, hasHelmet: true, hasVest: false, zone: 'Loading Dock', status: 'Moving', lastSeen: new Date().toISOString() },
  { id: 'WK-03', x: 15, y: 70, hasHelmet: false, hasVest: true, zone: 'Excavation Pit', status: 'Stationary', lastSeen: new Date().toISOString() },
];

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    const tl = gsap.timeline();
    
    tl.from('.hero-content > *', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Console Animation
    gsap.from('.console-box', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.5,
      ease: 'power4.out'
    });

    // Features Animation
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '#features',
        scroller: containerRef.current,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Performance Stats Animation
    gsap.from('.stat-item', {
      scrollTrigger: {
        trigger: '.performance-section',
        scroller: containerRef.current,
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // Security Section Animation
    gsap.from('.security-item', {
      scrollTrigger: {
        trigger: '#security',
        scroller: containerRef.current,
        start: 'top 80%',
      },
      x: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="h-screen bg-white text-slate-900 font-sans selection:bg-munch-olive/30 overflow-y-auto custom-scrollbar">
      
      {/* 1. HERO SECTION (Olive Gradient) */}
      <section className="relative min-h-[90vh] mesh-gradient noise-bg text-white flex flex-col items-center">
        
        {/* Navbar (Floating) */}
        <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 cursor-pointer" onClick={onEnter}>
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-bold tracking-tight text-lg">Sentinel®</span>
           </div>
           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={onEnter} 
                className="px-5 py-2 bg-white text-munch-olive rounded-full text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Go to Dashboard
              </button>
           </div>
        </nav>

        {/* Hero Content */}
        <div className="hero-content flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mt-12 mb-24 z-10">
           
           {/* Agent Loop Animation Pill */}
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-mono tracking-wider text-emerald-200">OBSERVE</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-75"></div>
                 <span className="text-[10px] font-mono tracking-wider text-amber-200">REASON</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                 <span className="text-[10px] font-mono tracking-wider text-blue-200">ACT</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                 <span className="text-[10px] font-mono tracking-wider text-purple-200">REFLECT</span>
              </div>
           </div>

           <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 leading-[1.1]">
             Sentinel – Autonomous Safety Monitoring<br/>
           </h1>
           <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-medium mb-12">
             Observe. Reason. Act. Construction safety, autonomously.
           </p>

           {/* Console Input Box */}
           <div className="console-box w-full max-w-2xl bg-[#111] rounded-2xl p-1 border border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="bg-[#0a0a0a] rounded-xl p-6 text-left min-h-[160px] flex flex-col justify-between relative">
                 <div className="text-slate-500 font-mono text-sm mb-2 flex justify-between">
                   <span>// SYSTEM_LOG: ACTIVE</span>
                   <span className="text-emerald-500">● ONLINE</span>
                 </div>
                 <div className="text-white font-mono text-lg">
                   <span className="text-slate-500">{'>'}</span> <span className="text-emerald-500">monitoring</span> <span className="text-white">sector_04_feed</span><br/>
                   <span className="text-slate-500">{'>'}</span> <span className="text-amber-500">detecting</span> <span className="text-white">objects: [worker, helmet, vest]</span><br/>
                   <span className="text-slate-500">{'>'}</span> <span className="text-blue-500">analyzing</span> <span className="text-white">compliance_rules...</span>
                   <span className="animate-pulse">_</span>
                 </div>
                 
                 <div className="flex justify-between items-end mt-8">
                    <button className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
                       View Logs <ChevronDown size={12} />
                    </button>
                    <button 
                      onClick={onEnter}
                      className="flex items-center gap-2 text-xs font-bold text-munch-olive bg-white px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <HowItWorks />

      {/* 3. FEATURE CARDS (White Bg) */}
      <section id="features" className="py-24 px-6 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16">
               <h2 className="text-3xl font-light text-slate-900 mb-4">Four Core Features of <br/> Intelligent Monitoring</h2>
               <p className="text-slate-500 max-w-lg text-sm">Everything you need to secure your site — powered by autonomous agents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* Card 1 */}
               <div className="feature-card bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
                     <div className="z-10">
                        <div className="text-xs font-mono text-emerald-400 mb-2">Monitor</div>
                        <h4 className="text-white font-bold text-lg mb-2">Autonomous Monitoring</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Zero human intervention required. Sentinel watches high-risk zones 24/7, never blinking, never sleeping.
                        </p>
                     </div>
                     <div className="mt-8 relative h-32 bg-black/40 rounded-lg border border-white/5 p-3 flex items-center justify-center">
                        <ScanEye size={48} className="text-emerald-500 opacity-80" />
                        <div className="absolute top-2 right-2 flex gap-1">
                           <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                           <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Card 2 (NEW) */}
               <div className="feature-card bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px]">
                     <div className="z-10">
                        <div className="text-xs font-mono text-orange-400 mb-2">Detect</div>
                        <h4 className="text-white font-bold text-lg mb-2">Real-time PPE Compliance</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Instantly identifies missing helmets, vests, and safety gear with high precision computer vision models.
                        </p>
                     </div>
                      <div className="mt-8 flex justify-center items-center h-32 relative">
                         <HardHat size={48} className="text-orange-500 opacity-80" />
                         <div className="absolute -top-2 -right-2 w-2 h-2 bg-orange-200 rounded-full animate-ping"></div>
                      </div>
                  </div>
               </div>

               {/* Card 3 */}
               <div className="feature-card bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px]">
                     <div className="z-10">
                        <div className="text-xs font-mono text-amber-400 mb-2">Reason</div>
                        <h4 className="text-white font-bold text-lg mb-2">Temporal Reasoning</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Filters out brief false positives. It understands that a worker adjusting a helmet for 2 seconds isn't a violation.
                        </p>
                     </div>
                      <div className="mt-8 flex justify-center items-center h-32 relative">
                         <Brain size={48} className="text-amber-500 opacity-80" />
                      </div>
                  </div>
               </div>

               {/* Card 4 */}
               <div className="feature-card bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px]">
                     <div className="z-10">
                        <div className="text-xs font-mono text-blue-400 mb-2">Log</div>
                        <h4 className="text-white font-bold text-lg mb-2">Auditable Incident Logs</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Comprehensive logging system. Every decision is recorded with timestamps, snapshots, and reasoning trace.
                        </p>
                     </div>
                     <div className="mt-8 space-y-2">
                        <div className="bg-white/5 p-2 rounded flex justify-between items-center border border-white/5">
                           <span className="text-[10px] text-slate-300 font-mono">incident_492.json</span>
                           <FileText size={12} className="text-blue-400"/>
                        </div>
                        <div className="bg-white/5 p-2 rounded flex justify-between items-center border border-white/5 opacity-60">
                           <span className="text-[10px] text-slate-300 font-mono">compliance_report.pdf</span>
                           <FileText size={12} className="text-blue-400"/>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. PERFORMANCE / DEMO (Black Bg) */}
      <section className="performance-section py-24 px-6 bg-[#050505] text-white">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-16">Trust, Backed by Real Performance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-left border-b border-white/10 pb-12 mb-12">
               <div className="stat-item">
                  <div className="text-3xl font-bold mb-1">99.5%</div>
                  <div className="text-sm text-slate-500">PPE Detection Accuracy</div>
               </div>
               <div className="stat-item">
                  <div className="text-3xl font-bold mb-1">&lt; 100ms</div>
                  <div className="text-sm text-slate-500">Inference Latency</div>
               </div>
               <div className="stat-item">
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-slate-500">Human Intervention</div>
               </div>
               <div className="stat-item">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-slate-500">Continuous Uptime</div>
               </div>
            </div>

             {/* DEMO / SNAPSHOT */}
             <div className="mt-20 bg-[#111] rounded-2xl p-2 border border-white/10 shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                   </div>
                   <span className="ml-4 text-[10px] font-mono text-slate-500">sentinel_dashboard_preview.exe</span>
                </div>
                {/* Embedded Live Feed as "Screenshot" */}
                <div className="h-[400px] relative pointer-events-none">
                    <ErrorBoundary>
                        <VideoPlayer workers={DEMO_WORKERS} simplified={true} />
                    </ErrorBoundary>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-left">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-200 text-xs font-bold mb-2">
                          <AlertTriangle size={12} />
                          VIOLATION DETECTED
                       </div>
                       <div className="text-white text-lg font-bold">Worker detected in Excavation Pit</div>
                       <div className="text-slate-400 text-sm">Zone Violation • Missing Vest • Confidence 98%</div>
                    </div>
                </div>
             </div>
         </div>
      </section>

      {/* 5. SECURITY & PRIVACY (White Bg) */}
      <section id="security" className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="flex-1">
               <h2 className="text-4xl font-light text-slate-900 mb-6">Security & Privacy <br/> by Design</h2>
               <p className="text-slate-500 text-sm max-w-xs">
                  We prioritize worker privacy and data security. Sentinel is built to monitor safety, not surveillance.
               </p>
            </div>
            <div className="flex-1 space-y-6">
               <div className="security-item border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Lock size={18} className="text-emerald-600" />
                       No personally identifiable information (PII) is stored
                     </h3>
                     <Minus size={16} />
                  </div>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                     Sentinel processes video streams to extract vector data only. Faces are blurred or ignored. No personally identifiable information is persisted.
                  </p>
               </div>
               <div className="security-item border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Server size={18} className="text-emerald-600" />
                       All video processing occurs locally on-site
                     </h3>
                     <Plus size={16} />
                  </div>
               </div>
               <div className="security-item border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Database size={18} className="text-emerald-600" />
                       Complete audit trail with anonymized incident logs
                     </h3>
                     <Plus size={16} />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. FOOTER CTA (Olive Gradient) */}
      <footer className="mesh-gradient py-32 px-6 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 noise-bg opacity-30"></div>
         <div className="relative z-10">
             <h2 className="text-4xl md:text-5xl font-light mb-4">Ready to secure your site?</h2>
             <h2 className="text-4xl md:text-5xl font-medium mb-12">Just Try It</h2>
             
             {/* Footer Console */}
             <div className="w-full max-w-xl mx-auto bg-black rounded-xl p-6 border border-white/10 text-left mb-16 shadow-2xl">
                 <div className="text-xs text-slate-500 mb-8 font-mono">// Waiting for input...</div>
                 <div className="flex justify-between items-center">
                    <span className="text-emerald-500 font-mono text-sm animate-pulse">{'>'} _</span>
                    <div className="flex gap-4">
                       <a href="#" className="text-[10px] flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors">
                          <Github size={12} /> View GitHub
                       </a>
                       <button onClick={onEnter} className="text-[10px] font-bold bg-white text-munch-olive px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
                          Go to Dashboard
                       </button>
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto text-left text-xs text-slate-400 border-t border-white/10 pt-12 gap-8">
                 <div>
                    <div className="text-white font-bold mb-4 flex items-center gap-2">
                       <div className="w-3 h-3 bg-white rounded-full"></div> Sentinel®
                    </div>
                    <p>San Francisco, CA</p>
                    <p className="mt-4">contact@sentinel.ai</p>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Product</h4>
                    <ul className="space-y-2">
                       <li>Autonomous Agent</li>
                       <li>Computer Vision</li>
                       <li>Integrations</li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Use Cases</h4>
                    <ul className="space-y-2">
                       <li>Construction</li>
                       <li>Manufacturing</li>
                       <li>Logistics</li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Resources</h4>
                    <ul className="space-y-2">
                       <li>Documentation</li>
                       <li>API Reference</li>
                       <li>System Status</li>
                    </ul>
                 </div>
             </div>
         </div>
      </footer>
    </div>
  )
}

export default LandingPage;
