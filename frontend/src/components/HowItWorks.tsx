import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import IsometricCube from './IsometricCube';

const STEPS = [
  {
    id: 1,
    title: "Video Ingestion & Perception.",
    description: "Ingests RTSP streams in real-time. Computer vision models identify workers, equipment, and zones, converting raw pixels into structured spatial data.",
    cubeType: 1,
    align: "right"
  },
  {
    id: 2,
    title: "Cognitive Reasoning with Gemini 3.",
    description: "The core reasoning engine interprets the scene context. Is that worker entering a pit? Are they securing their harness? It filters noise and understands intent.",
    cubeType: 2,
    align: "left"
  },
  {
    id: 3,
    title: "Decision, Action & Logging.",
    description: "If a violation is confirmed, Sentinel acts instantly—logging the incident, saving a snapshot, and updating the site safety score.",
    cubeType: 3,
    align: "right"
  }
];

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className={`py-32 px-6 max-w-6xl mx-auto transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      aria-label="How Sentinel Works"
    >
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-white mb-6">
          The Agentic Loop:<br/> From Pixels to Decisions
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
          Sentinel operates on a continuous feedback loop, processing visual data into actionable safety intelligence without human intervention.
        </p>
        
        {/* Responsive Diagram Module */}
        <div 
          className="mt-12 flex flex-wrap justify-center items-center gap-4 text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
          role="list"
          aria-label="Process Flow"
        >
          {[
            { label: "VIDEO", bg: "bg-slate-50 dark:bg-slate-800" },
            { label: "PERCEPTION", bg: "bg-slate-50 dark:bg-slate-800" },
            { label: "GEMINI 3", bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
            { label: "DECISION", bg: "bg-slate-50 dark:bg-slate-800" },
            { label: "LOG", bg: "bg-slate-50 dark:bg-slate-800" }
          ].map((step, index, array) => (
            <React.Fragment key={step.label}>
              <span 
                className={`px-3 py-1 border dark:border-slate-700 rounded ${step.bg}`}
                role="listitem"
              >
                {step.label}
              </span>
              {index < array.length - 1 && (
                <ArrowRight size={12} className="hidden sm:block text-slate-300 dark:text-slate-600" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div 
          className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden md:block -z-10" 
          aria-hidden="true"
        />
        
        {/* Steps */}
        <div className="space-y-32">
          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className="flex flex-col md:flex-row items-center gap-12 md:gap-24 group"
            >
              {/* Content Side */}
              <div className={`flex-1 ${step.align === 'right' ? 'text-right md:text-left md:order-1' : 'md:order-2 text-left'}`}>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 block" aria-hidden="true">
                  0{step.id}
                </span>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm ml-auto md:ml-0 mr-auto md:mr-0">
                  {step.description}
                </p>
              </div>

              {/* Graphic Side */}
              <div className={`flex-1 flex justify-center ${step.align === 'right' ? 'md:order-2' : 'md:order-1'}`}>
                <div className="transform transition-transform duration-500 group-hover:scale-110">
                  <IsometricCube type={step.cubeType} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
