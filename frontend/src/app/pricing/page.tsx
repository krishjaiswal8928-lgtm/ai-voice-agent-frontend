'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Rocket, Crown, Building2, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface PlanLimits {
    voice_minutes: number;
    ai_agents: number;
    phone_numbers: number;
    documents: number;
    websites: number;
    outbound_calls: number;
    recording_enabled: boolean;
    analytics_tier: string;
}

interface Plan {
    name: string;
    displayName: string;
    tagline: string;
    price: number | string;
    priceUSD?: number;
    priceEUR?: number;
    yearlyPrice?: number;
    credits: string;
    agentCredits: string;
    accentColor: string;
    borderColor: string;
    glowColor: string;
    icon: any;
    limits: PlanLimits;
    features: string[];
    support: string;
}

type Currency = 'USD' | 'INR' | 'EUR';

export default function ModernPricingPage() {
    const [plans, setPlans] = useState<Record<string, Plan>>({});
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(true);
    const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
    const [currency, setCurrency] = useState<Currency>('USD');

    useEffect(() => {
        fetchPlans();
        fetchCurrentSub();
        // Load currency preference from localStorage
        const savedCurrency = localStorage.getItem('preferredCurrency') as Currency;
        if (savedCurrency) setCurrency(savedCurrency);
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/pricing/plans');
            const data = await res.json();

            // Enhance plans with display data
            const enhancedPlans: Record<string, Plan> = {
                free: {
                    ...data.plans.free,
                    displayName: 'AI Starter',
                    tagline: 'Try before you buy — no strings attached',
                    price: 0,
                    priceUSD: 0,
                    priceEUR: 0,
                    credits: '20K',
                    agentCredits: '$1',
                    accentColor: 'from-green-400 to-emerald-500',
                    borderColor: 'border-green-500',
                    glowColor: 'shadow-green-500/20',
                    icon: Sparkles,
                    features: [
                        '60 voice minutes/month',
                        '2 AI agents',
                        '1 phone number',
                        '1 RAG document',
                        '1 website scraping',
                        'Basic analytics dashboard',
                        'Core AI models (GPT-3.5, Claude)',
                        'Discord community support',
                        'Email notifications'
                    ],
                    support: 'Discord Community'
                },
                starter: {
                    ...data.plans.starter,
                    displayName: 'AI Pro',
                    tagline: 'Ready to go commercial? This is your launchpad',
                    price: 1700,
                    priceUSD: 20,
                    priceEUR: 18,
                    yearlyPrice: 4,
                    credits: '800K',
                    agentCredits: '$5',
                    accentColor: 'from-teal-400 to-cyan-500',
                    borderColor: 'border-teal-500',
                    glowColor: 'shadow-teal-500/20',
                    icon: Zap,
                    features: [
                        '500 voice minutes/month',
                        '4 AI agents',
                        '1 phone number',
                        '10 RAG documents',
                        '3 website scraping',
                        'Instant voice cloning',
                        'Sentiment analytics',
                        'Call recording (basic)',
                        'Advanced AI models',
                        'Email support (24h response)',
                        'API access'
                    ],
                    support: 'Email (24h)'
                },
                growth: {
                    ...data.plans.growth,
                    displayName: 'AI Growth',
                    tagline: "Scaling your team? We've got your back",
                    price: 7500,
                    priceUSD: 89,
                    priceEUR: 82,
                    yearlyPrice: 39,
                    credits: '4M',
                    agentCredits: '$49',
                    accentColor: 'from-blue-400 to-indigo-500',
                    borderColor: 'border-blue-500',
                    glowColor: 'shadow-blue-500/20',
                    icon: Rocket,
                    features: [
                        '2,500 voice minutes/month',
                        '7 AI agents',
                        '3 phone numbers',
                        '50 RAG documents',
                        '10 website scraping',
                        '10 outbound calls/hour',
                        'Full call logs & transcripts',
                        'Advanced sentiment analysis',
                        'Team collaboration tools',
                        'Custom voice training',
                        'Webhook integrations',
                        'Priority email support (12h)',
                        'Monthly strategy calls'
                    ],
                    support: 'Priority Email (12h)'
                },
                pro: {
                    ...data.plans.pro,
                    displayName: 'AI Scale',
                    tagline: 'High volume. High stakes. High performance',
                    price: 30000,
                    priceUSD: 359,
                    priceEUR: 329,
                    yearlyPrice: 239,
                    credits: '8M',
                    agentCredits: '$299',
                    accentColor: 'from-purple-400 to-violet-600',
                    borderColor: 'border-purple-600',
                    glowColor: 'shadow-purple-500/20',
                    icon: Crown,
                    features: [
                        '10,000 voice minutes/month',
                        '15 AI agents',
                        '10 phone numbers',
                        '200 RAG documents',
                        '30 website scraping',
                        '100 outbound calls/hour',
                        'Unlimited call recording',
                        'GDPR & SOC2 compliance ready',
                        'Advanced analytics & reporting',
                        'Multi-language support (50+ languages)',
                        'Custom integrations (Salesforce, HubSpot)',
                        'White-label options',
                        '24/7 Slack support',
                        'Dedicated onboarding specialist'
                    ],
                    support: '24/7 Slack'
                },
                enterprise: {
                    ...data.plans.enterprise,
                    displayName: 'AI Enterprise',
                    tagline: 'Your mission-critical AI solution — built just for you',
                    price: 'Contact Us',
                    credits: 'Unlimited',
                    agentCredits: 'Custom',
                    accentColor: 'from-violet-600 to-purple-800',
                    borderColor: 'border-violet-700',
                    glowColor: 'shadow-violet-500/30',
                    icon: Building2,
                    features: [
                        'Unlimited voice minutes',
                        'Unlimited AI agents',
                        'Unlimited phone numbers',
                        'Unlimited RAG documents & websites',
                        'Unlimited outbound calls',
                        'Dedicated phone numbers & SIP trunks',
                        'Custom SLA & 99.99% uptime guarantee',
                        'Enterprise-grade security & encryption',
                        'Custom AI model fine-tuning',
                        'On-premise deployment options',
                        'Advanced compliance (HIPAA, PCI-DSS)',
                        'Custom feature development',
                        'Dedicated account manager',
                        'Priority feature requests',
                        '24/7 phone & video support'
                    ],
                    support: 'Dedicated Manager + 24/7'
                }
            };

            setPlans(enhancedPlans);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentSub = async () => {
        try {
            const res = await fetch('/api/pricing/current');
            const data = await res.json();
            setCurrentPlan(data.plan || 'free');
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
        }
    };

    const handleSelectPlan = async (planKey: string) => {
        if (planKey === 'enterprise') {
            window.location.href = 'mailto:sales@speaksynth.ai?subject=Enterprise Inquiry';
            return;
        }

        try {
            const res = await fetch('/api/pricing/select-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planKey })
            });

            const data = await res.json();
            alert(data.message);
            setCurrentPlan(planKey);
        } catch (error) {
            alert('Failed to select plan');
        }
    };

    const toggleFeatures = (planKey: string) => {
        setExpandedFeatures(prev => ({
            ...prev,
            [planKey]: !prev[planKey]
        }));
    };

    const handleCurrencyChange = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        localStorage.setItem('preferredCurrency', newCurrency);
    };

    const formatPrice = (plan: Plan): string => {
        if (typeof plan.price === 'string') return plan.price;

        switch (currency) {
            case 'USD':
                return `$${plan.priceUSD || 0}`;
            case 'EUR':
                return `€${plan.priceEUR || 0}`;
            case 'INR':
                return `₹${plan.price.toLocaleString('en-IN')}`;
            default:
                return `$${plan.priceUSD || 0}`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-slate-400 font-semibold text-lg">Loading plans...</p>
                </div>
            </div>
        );
    }

    const planOrder = ['free', 'starter', 'growth', 'pro', 'enterprise'];

    return (
        <div className="min-h-screen bg-slate-950 pricing-page-container">
            <style jsx global>{`
                @keyframes checkmark-pop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                .checkmark-animate {
                    animation: checkmark-pop 0.3s ease-out forwards;
                }
                
                .pricing-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }
                
                .pricing-card:hover {
                    transform: translateY(-12px) scale(1.02);
                }
                
                .cta-button {
                    transition: all 0.3s ease-out;
                    background-size: 200% 200%;
                }
                
                .cta-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.5);
                    background-position: right center;
                }

                .pricing-page-container {
                    position: relative;
                    background: #0f172a;
                }

                .pricing-page-container::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
                    background-size: 20px 20px;
                    opacity: 1;
                    pointer-events: none;
                    z-index: 0;
                }

                .pricing-page-container::after {
                    content: '';
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 30%, transparent 70%);
                    opacity: 1;
                    pointer-events: none;
                    z-index: 0;
                    animation: glow-pulse 8s ease-in-out infinite;
                }

                .pricing-page-container > * {
                    position: relative;
                    z-index: 1;
                }
                
                .gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 8s ease infinite;
                }
            `}</style>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight gradient-text">
                        Choose Your AI Journey
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        From curious explorer to enterprise powerhouse — find the perfect plan for your AI adoption stage
                    </p>

                    {/* Currency Toggle */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-slate-500" />
                        <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-1.5 shadow-lg">
                            {(['USD', 'INR', 'EUR'] as Currency[]).map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => handleCurrencyChange(curr)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${currency === curr
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
                    {planOrder.map((planKey) => {
                        const plan = plans[planKey];
                        if (!plan) return null;

                        const Icon = plan.icon;
                        const isCurrent = currentPlan === planKey;
                        const isPopular = planKey === 'growth';

                        return (
                            <div
                                key={planKey}
                                className={`
                                    pricing-card relative bg-slate-900/60 rounded-2xl overflow-hidden
                                    border-2 ${isCurrent ? plan.borderColor : 'border-slate-700/50'}
                                    ${isPopular ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-105 z-10' : ''}
                                    shadow-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]
                                `}
                                style={{
                                    boxShadow: isPopular
                                        ? '0 0 60px rgba(99, 102, 241, 0.4)'
                                        : '0 10px 40px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                {/* Gradient Accent Bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${plan.accentColor}`}></div>

                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute top-4 -right-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-l-full shadow-lg shadow-blue-500/50 z-10">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrent && (
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/50">
                                        ✓ CURRENT
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Icon */}
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.accentColor} mb-5 shadow-xl`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {plan.displayName}
                                    </h3>

                                    {/* Tagline */}
                                    <p className="text-sm text-slate-400 mb-6 min-h-[48px] italic leading-relaxed">
                                        "{plan.tagline}"
                                    </p>

                                    {/* Price */}
                                    <div className="mb-6">
                                        {typeof plan.price === 'number' ? (
                                            <div>
                                                <div className="flex items-baseline">
                                                    <span className="text-5xl font-bold text-white">
                                                        {formatPrice(plan)}
                                                    </span>
                                                    <span className="text-slate-400 ml-2 text-lg">/month</span>
                                                </div>
                                                {plan.yearlyPrice && (
                                                    <div className="mt-3 text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg inline-block">
                                                        💰 Save 20% yearly (${plan.yearlyPrice}/mo)
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-3xl font-bold text-white">
                                                Contact Us
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSelectPlan(planKey)}
                                        disabled={isCurrent}
                                        className={`
                                            cta-button w-full py-3.5 px-6 rounded-xl font-bold text-sm
                                            ${isCurrent
                                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/50'
                                                : planKey === 'enterprise'
                                                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50'
                                                    : isPopular
                                                        ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50'
                                                        : `bg-gradient-to-r ${plan.accentColor} text-white shadow-xl hover:shadow-2xl`
                                            }
                                        `}
                                    >
                                        {isCurrent ? '✓ Current Plan' : planKey === 'enterprise' ? '📞 Contact Sales' : planKey === 'free' ? '🚀 Start Free' : '⚡ Select Plan'}
                                    </button>

                                    {/* Prepaid Credits */}
                                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                                        <div className="flex justify-between text-sm mb-2.5">
                                            <span className="text-slate-400">Model Credits</span>
                                            <span className="font-bold text-white">{plan.credits}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Agent Credits</span>
                                            <span className="font-bold text-white">{plan.agentCredits}</span>
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="mt-6">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="text-lg">✨</span> Key Features:
                                        </h4>
                                        <ul className="space-y-3">
                                            {plan.features.slice(0, expandedFeatures[planKey] ? undefined : 5).map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-slate-300">
                                                    <Check className="checkmark-animate w-4 h-4 text-green-400 mr-2.5 mt-0.5 flex-shrink-0" style={{ animationDelay: `${idx * 50}ms` }} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Expand/Collapse */}
                                        {plan.features.length > 5 && (
                                            <button
                                                onClick={() => toggleFeatures(planKey)}
                                                className="mt-4 text-sm text-blue-400 hover:text-blue-300 flex items-center font-semibold transition-colors"
                                            >
                                                {expandedFeatures[planKey] ? (
                                                    <>
                                                        Show less <ChevronUp className="w-4 h-4 ml-1" />
                                                    </>
                                                ) : (
                                                    <>
                                                        See all {plan.features.length} features <ChevronDown className="w-4 h-4 ml-1" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Support */}
                                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <span className="text-lg">🎧</span> Support
                                            </span>
                                            <span className="font-bold text-white">{plan.support}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Signals */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-10 mb-16 shadow-2xl border border-slate-700/50">
                    <h2 className="text-3xl font-bold text-white text-center mb-10">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎁</div>
                            <div className="text-2xl font-bold text-white mb-3">No Credit Card</div>
                            <p className="text-slate-400 leading-relaxed">Start free, upgrade when ready. No hidden fees.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl mb-4">💎</div>
                            <div className="text-2xl font-bold text-white mb-3">Prepaid Credits</div>
                            <p className="text-slate-400 leading-relaxed">Predictable costs, transparent billing. No surprises.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl mb-4">🛡️</div>
                            <div className="text-2xl font-bold text-white mb-3">Enterprise Security</div>
                            <p className="text-slate-400 leading-relaxed">GDPR, SOC2 compliant. Your data is safe with us.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="text-center bg-slate-900/60 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-slate-700/50">
                    <h3 className="text-2xl font-bold text-white mb-5">Have Questions?</h3>
                    <p className="text-slate-400 mb-6 text-lg leading-relaxed">
                        Our team is here to help you find the perfect plan for your needs.
                    </p>
                    <a
                        href="mailto:support@speaksynth.ai"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-lg transition-colors"
                    >
                        📧 Contact our team →
                    </a>
                </div>
            </div>
        </div>
    );
}
