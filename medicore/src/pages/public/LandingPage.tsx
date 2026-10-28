import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Heart, Hospital, Calendar, Users, Star, ArrowRight,
  MapPin, Phone, Clock, Shield, CheckCircle, ChevronDown,
  Brain, Stethoscope, Baby, Eye, Pill, Zap, MessageCircle
} from 'lucide-react';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { seedHospitals } from '../../data/seedData';

const features = [
  { icon: Calendar, title: 'Easy Appointment Booking', desc: 'Book appointments with top doctors in just a few clicks. Choose your preferred time slot instantly.', color: 'blue' },
  { icon: Hospital, title: 'Hospital Discovery', desc: 'Find hospitals near you with detailed profiles, departments, facilities, and real doctor listings.', color: 'teal' },
  { icon: Shield, title: 'Secure Medical Records', desc: 'Access your visit history, diagnoses, and prescriptions all in one organized, easy-to-read dashboard.', color: 'emerald' },
  { icon: Brain, title: 'AI Health Assistant', desc: 'Get instant answers to healthcare questions from our intelligent MediCore AI chatbot, available 24/7.', color: 'purple' },
  { icon: Zap, title: 'Real-time Updates', desc: 'Receive instant notifications for appointment confirmations, reminders, and status changes.', color: 'amber' },
  { icon: Users, title: 'Multi-Role Access', desc: 'Separate dashboards for patients and hospitals, each tailored to their specific needs and workflows.', color: 'rose' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Register as a patient or hospital in under 2 minutes. No credit card required.', icon: Users },
  { step: '02', title: 'Find a Doctor', desc: 'Search hospitals and doctors by specialization, location, or department.', icon: Stethoscope },
  { step: '03', title: 'Book Appointment', desc: 'Select your preferred date, time, and doctor. Confirm with one click.', icon: Calendar },
  { step: '04', title: 'Get Care', desc: 'Attend your appointment and access your medical records and prescriptions online.', icon: Heart },
];

const testimonials = [
  {
    name: 'Divya Krishnan',
    role: 'Patient',
    text: 'MediCore made booking my cardiology appointment so easy. I found the hospital, checked the doctor\'s schedule, and got confirmed in minutes. Truly a great experience! [Demo Testimonial — Sample Data]',
    rating: 5,
    avatar: 'D',
    city: 'Bengaluru',
  },
  {
    name: 'Rohan Malhotra',
    role: 'Patient',
    text: 'Being able to see all my medical records and prescriptions in one place is fantastic. The AI assistant answered my queries about my medication clearly. [Demo Testimonial — Sample Data]',
    rating: 5,
    avatar: 'R',
    city: 'Delhi',
  },
  {
    name: 'Anita Desai',
    role: 'Hospital Admin',
    text: 'MediCore\'s hospital dashboard transformed how we manage appointments. The analytics give us clear insights into our operations every day. [Demo Testimonial — Sample Data]',
    rating: 5,
    avatar: 'A',
    city: 'Mumbai',
  },
];

const faqs = [
  { q: 'Is MediCore free to use?', a: 'This is a college demonstration project. All features are available for exploration without any fees. No real payments are involved.' },
  { q: 'Is my data secure?', a: 'This is a demo application. Data is stored in browser localStorage only and never transmitted to any server. Do not enter real personal or medical information.' },
  { q: 'Can I book appointments with real doctors?', a: 'No. MediCore is a college demonstration project. All doctors, hospitals, and appointments shown are fictional sample data for demonstration purposes only.' },
  { q: 'How does the AI assistant work?', a: 'The AI assistant uses OpenRouter API (configured via Vercel environment variables) to answer general healthcare and application navigation questions. It does not provide real medical advice.' },
  { q: 'Does MediCore work on mobile?', a: 'Yes, MediCore is fully responsive and works on mobile phones, tablets, and desktops with a modern mobile-first design.' },
];

const colorMap: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  teal: 'from-teal-500 to-teal-600',
  emerald: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* BG decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Smart Hospital Management System
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 dark:text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Health,{' '}
              <span className="text-gradient">Our Priority</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-slate-600 dark:text-slate-300">
                Smarter Healthcare Starts Here
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              MediCore connects patients with the best hospitals and doctors, making appointment booking, medical records, and healthcare management effortlessly simple.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/hospitals" className="btn-primary px-8 py-3.5 text-base">
                <Hospital size={18} />
                Find a Hospital
                <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-3.5 text-base">
                Get Started Free
              </Link>
            </motion.div>

            {/* Demo Notice */}
            <motion.p
              className="mt-4 text-xs text-slate-400 dark:text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              College Demonstration Project — All data is fictional sample data
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: 'Demo Hospitals', value: 50, suffix: '+', icon: Hospital },
              { label: 'Demo Doctors', value: 200, suffix: '+', icon: Stethoscope },
              { label: 'Demo Appointments', value: 1000, suffix: '+', icon: Calendar },
              { label: 'Demo Patients', value: 5000, suffix: '+', icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card p-5 text-center hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-slate-400" />
        </motion.div>
      </section>

      {/* Features */}
      <Section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 mb-3">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white">
              Everything you need for smarter healthcare
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From appointment booking to AI-powered health assistance, MediCore brings the future of healthcare management to your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="card-hover p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center mb-4 shadow-sm`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white font-heading mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800 mb-3">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white">
              Get started in 4 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-100 via-teal-100 to-emerald-100 dark:from-blue-900/20 dark:via-teal-900/20 dark:to-emerald-900/20" />
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                  <step.icon size={24} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Hospitals */}
      <Section id="hospitals" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 mb-2">
                Demo Hospitals — Sample Data
              </span>
              <h2 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
                Featured Hospitals
              </h2>
            </div>
            <Link to="/hospitals" className="btn-secondary hidden sm:flex">
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seedHospitals.slice(0, 3).map((hospital, i) => (
              <motion.div
                key={hospital.id}
                className="card-hover overflow-hidden"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-36 bg-gradient-to-br from-blue-600 to-teal-600 relative flex items-center justify-center">
                  <Hospital size={48} className="text-white/30" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-3 left-4">
                    <span className="badge bg-white/20 text-white text-xs border border-white/30">
                      {hospital.hospitalType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 badge">
                    Demo Hospital
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white font-heading text-base mb-1">
                    {hospital.hospitalName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <MapPin size={14} />
                    {hospital.city}, {hospital.state}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {hospital.departments.slice(0, 3).map((dept) => (
                      <span key={dept} className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                        {dept}
                      </span>
                    ))}
                    {hospital.departments.length > 3 && (
                      <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        +{hospital.departments.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          size={12}
                          className={j < Math.floor(hospital.rating ?? 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{hospital.rating?.toFixed(1)}</span>
                    </div>
                    <Link
                      to={`/hospitals/${hospital.id}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                    >
                      View
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 mb-3">
              Testimonials — Demo Sample Data
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white">
              What users are saying
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.role} · {t.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="about" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Everything you need to know about MediCore.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                className="card p-5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{faq.q}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Ready to experience smarter healthcare?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join MediCore today and take control of your healthcare journey. It's free, fast, and built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all shadow-md"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/hospitals"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all border border-white/30"
              >
                Browse Hospitals
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Heart size={16} className="text-white" fill="white" />
                </div>
                <span className="text-lg font-bold font-heading text-white">
                  Medi<span className="text-blue-400">Core</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Smart Hospital Management System — A college final-year project demonstrating modern healthcare technology. All data is fictional.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {['Home', 'Hospitals', 'Features', 'About'].map((l) => (
                  <li key={l}>
                    <Link to="/" className="hover:text-white transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/patient/dashboard" className="hover:text-white transition-colors">
                    Patient Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/hospital/dashboard" className="hover:text-white transition-colors">
                    Hospital Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 MediCore — College Final Year Project. All sample data is fictional.</p>
            <p className="text-slate-500">
              Built with React + TypeScript + Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
