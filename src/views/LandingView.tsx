import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Compass, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  Utensils,
  CheckCircle2
} from 'lucide-react';
import type { Route } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

interface LandingViewProps {
  onNavigate: (route: Route) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 py-4 sm:py-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Deterministic South Indian Diet Planner
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
        >
          Eat South Indian Dishes That <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Fit Your Daily Macros
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
        >
          GAUGE takes your target calories & protein and reverse-engineers delicious South Indian meals. No vague chatbot advice — just precision ingredient math and authentic recipes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto shadow-xl shadow-emerald-500/25"
            icon={<Compass className="w-5 h-5" />}
            iconPosition="left"
            onClick={() => onNavigate('generator')}
          >
            Try Meal Generator
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button 
            variant="secondary" 
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => onNavigate('dashboard')}
          >
            Go to Dashboard
          </Button>
        </motion.div>

        {/* Quick Features List */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Database-Driven Math
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Portion & Oil Adjuster
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authentic South Indian Data
          </span>
        </div>
      </section>

      {/* Interactive Example Recommendation Card Preview */}
      <section className="px-4">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Example Goal</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            "I have <span className="text-amber-400">500 kcal</span> and <span className="text-emerald-400">30g protein</span> left for breakfast"
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <GlassCard variant="gradient" className="space-y-3 border-emerald-500/30">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Match 94%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Breakfast</span>
            </div>
            <h3 className="font-bold text-lg text-white">Chicken Dosa</h3>
            <p className="text-xs text-slate-400">Spiced minced chicken breast stuffed inside crisp rice crepe.</p>
            <div className="flex items-center justify-between text-xs font-mono font-bold pt-2 border-t border-slate-800">
              <span className="text-amber-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 480 kcal</span>
              <span className="text-emerald-400 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> 36g protein</span>
            </div>
          </GlassCard>

          <GlassCard variant="gradient" className="space-y-3 border-teal-500/30">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-400">
              <span>Match 91%</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">Breakfast</span>
            </div>
            <h3 className="font-bold text-lg text-white">Egg & Pulse Adai</h3>
            <p className="text-xs text-slate-400">Lentil pancake topped with 2 whole country eggs.</p>
            <div className="flex items-center justify-between text-xs font-mono font-bold pt-2 border-t border-slate-800">
              <span className="text-amber-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 465 kcal</span>
              <span className="text-emerald-400 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> 31g protein</span>
            </div>
          </GlassCard>

          <GlassCard variant="gradient" className="space-y-3 border-cyan-500/30">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Match 96%</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Breakfast</span>
            </div>
            <h3 className="font-bold text-lg text-white">Chicken Fry + 3 Idlis</h3>
            <p className="text-xs text-slate-400">Air-fried spiced pepper chicken paired with steamed fluffy idlis.</p>
            <div className="flex items-center justify-between text-xs font-mono font-bold pt-2 border-t border-slate-800">
              <span className="text-amber-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 495 kcal</span>
              <span className="text-emerald-400 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> 42g protein</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <GlassCard className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Deterministic Meal Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No guessing or AI hallucinations. Meals are filtered and ranked mathematically based on structured ingredient data.
          </p>
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Oil & Portion Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            South Indian cooking often hides high oil calories. GAUGE calculates low-oil adjustments dynamically.
          </p>
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Authentic Regional Flavors</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Curated dishes across Tamil, Kerala, Andhra, and Karnataka cuisines tailored to modern macro targets.
          </p>
        </GlassCard>
      </section>

      {/* CTA Box */}
      <section className="px-4">
        <GlassCard variant="gradient" className="p-8 text-center space-y-5 border-emerald-500/40">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to hit your protein targets with South Indian food?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Set your daily calorie and protein targets in seconds and let GAUGE plan your meals.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('onboarding')}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Start Macro Setup
            </Button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
