"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp,
  Receipt,
  Users,
  BarChart3,
  Sparkles,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  Smartphone,
  Star,
  Check,
  Play,
  Building2,
  Wallet,
  CreditCard,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const user = await response.json();
          switch (user.role) {
            case "ADMIN":
              router.push("/dashboard/admin");
              break;
            case "MANAGER":
              router.push("/dashboard/manager");
              break;
            case "EMPLOYEE":
              router.push("/dashboard/employee");
              break;
            default:
              router.push("/dashboard");
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 mx-auto mb-4"
          >
            <Sparkles className="h-16 w-16 text-blue-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">EXPENSEWISE</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <Navigation router={router} />

      {/* Hero Section */}
      <HeroSection router={router} heroRef={heroRef} opacity={opacity} scale={scale} />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing Preview */}
      <PricingSection router={router} />

      {/* CTA Section */}
      <CTASection router={router} />

      {/* Footer */}
      <Footer router={router} />
    </div>
  );
}

function Navigation({ router }: any) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EXPENSEWISE
            </span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </a>
            <Button
              variant="ghost"
              onClick={() => router.push("/signin")}
              className="text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection({ router, heroRef, opacity, scale }: any) {
  return (
    <motion.section 
      ref={heroRef}
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">AI-Powered Expense Management</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Simplify Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Expense Tracking
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Automate expense reports, streamline approvals, and gain real-time insights into your company spending with EXPENSEWISE.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-2 hover:bg-gray-50 group"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center space-x-6 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - 3D Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative" style={{ perspective: "1000px" }}>
              {/* Main Card */}
              <motion.div
                animate={{
                  rotateY: [0, 5, 0, -5, 0],
                  rotateX: [0, 2, 0, -2, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-white rounded-3xl shadow-2xl p-8"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="space-y-6">
                  {/* Receipt Preview */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Business Lunch</div>
                          <div className="text-sm text-gray-500">Today, 2:30 PM</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">$124.50</div>
                        <div className="text-sm text-green-600">Approved</div>
                      </div>
                    </div>
                    <div className="h-32 bg-white/50 rounded-xl flex items-center justify-center">
                      <FileText className="h-16 w-16 text-blue-300" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: Clock, label: "Pending", value: "12" },
                      { icon: CheckCircle, label: "Approved", value: "48" },
                      { icon: DollarSign, label: "Total", value: "$8.2K" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gray-50 rounded-xl p-4 text-center"
                      >
                        <stat.icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Approved!</div>
                    <div className="text-xs text-gray-500">2 mins ago</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">AI Processed</div>
                    <div className="text-xs text-gray-500">Instant scan</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="h-8 w-8 text-gray-400" />
      </motion.div>
    </motion.section>
  );
}

function TrustedBySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const companies = [
    "TechCorp", "GlobalInc", "StartupXYZ", "Enterprise Co", "Innovation Labs", "Digital Solutions"
  ];

  return (
    <section ref={ref} className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Trusted by 10,000+ companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center"
              >
                <div className="text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                  {company}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Zap,
      title: "AI-Powered OCR",
      description: "Snap a photo of your receipt and let AI extract all the details instantly. No manual data entry required.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Handle expenses in 150+ currencies with real-time exchange rates and automatic conversion to your base currency.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Smart Approval Workflows",
      description: "Configure custom approval rules based on amount, category, or department with automated routing.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Get instant insights into spending patterns, trends, and budget utilization with interactive dashboards.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Submit and approve expenses on the go with our fully responsive mobile interface.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage users, assign roles, and track team expenses with enterprise-grade security and permissions.",
      color: "from-red-500 to-orange-500",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify expense management for teams of all sizes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index, isInView }: any) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ 
        y: -10, 
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      className="relative group"
      style={{ perspective: "1000px" }}
    >
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
        {/* Gradient Background on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
        />

        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600">
          {feature.description}
        </p>

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute bottom-8 right-8"
        >
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    "Save 10+ hours per week on expense processing",
    "Reduce errors by 95% with automated data entry",
    "Get real-time visibility into company spending",
    "Ensure compliance with customizable approval rules",
    "Support remote teams with mobile-first design",
    "Integrate with your existing accounting software",
  ];

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: 3D Card Stack */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative" style={{ perspective: "1000px" }}>
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  initial={{ rotateY: -20, z: -100 * index }}
                  animate={isInView ? { 
                    rotateY: 0, 
                    z: -50 * index,
                    x: 20 * index,
                    y: 20 * index,
                  } : {}}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{ 
                    z: 50,
                    rotateY: 10,
                    transition: { duration: 0.3 }
                  }}
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Receipt className="h-24 w-24 text-blue-600 opacity-20" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose ExpenseWise?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of companies that trust ExpenseWise for their expense management needs.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 mt-1"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </motion.div>
                  <span className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    {
      number: "01",
      title: "Capture Receipt",
      description: "Take a photo of your receipt or upload it from your device. Our AI instantly extracts all the details.",
      icon: Smartphone,
    },
    {
      number: "02",
      title: "Review & Submit",
      description: "Verify the auto-filled information, add notes if needed, and submit for approval with one click.",
      icon: CheckCircle,
    },
    {
      number: "03",
      title: "Automated Approval",
      description: "Your expense is automatically routed to the right approver based on your company's workflow rules.",
      icon: Zap,
    },
    {
      number: "04",
      title: "Get Reimbursed",
      description: "Once approved, your expense is processed for reimbursement and you get notified instantly.",
      icon: Wallet,
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple Process, Powerful Results
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From receipt to reimbursement in just four easy steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-6xl font-bold text-blue-100 mb-4">{step.number}</div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl inline-flex mb-4">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-blue-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CFO at TechCorp",
      avatar: "SJ",
      content: "EXPENSEWISE has transformed how we handle expenses. We've reduced processing time by 80% and our team loves how easy it is to use.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Finance Manager at GlobalInc",
      avatar: "MC",
      content: "The AI-powered OCR is incredibly accurate. It saves our employees hours of manual data entry every week. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director at StartupXYZ",
      avatar: "ER",
      content: "Best expense management tool we've used. The multi-currency support is perfect for our international team. Setup was a breeze.",
      rating: 5,
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4" />
            <span className="text-sm font-semibold">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Finance Teams Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers have to say about EXPENSEWISE
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ router }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 10 users",
        "AI-powered OCR",
        "Multi-currency support",
        "Basic reporting",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "For growing teams with advanced needs",
      features: [
        "Up to 50 users",
        "Everything in Starter",
        "Custom approval workflows",
        "Advanced analytics",
        "Priority support",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific requirements",
      features: [
        "Unlimited users",
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-semibold">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your team. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                plan.popular ? "ring-2 ring-blue-600" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push("/signup")}
                className={`w-full py-6 text-lg ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ router }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Expense Management?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join 10,000+ companies using EXPENSEWISE. Start your 14-day free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-lg font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-12 py-6 text-lg font-semibold"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </div>

          <p className="text-blue-100 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ router }: any) {
  const footerLinks = {
    Product: ["Features", "Pricing", "Security", "Integrations", "API"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Contact", "Status"],
    Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses", "Compliance"],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EXPENSEWISE</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Simplifying expense management for modern teams.
            </p>
            <div className="flex space-x-4">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 EXPENSEWISE. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
