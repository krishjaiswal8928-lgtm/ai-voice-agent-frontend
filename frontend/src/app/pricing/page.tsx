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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading plans...</p>
                </div>
            </div>
        );
    }

    const planOrder = ['free', 'starter', 'growth', 'pro', 'enterprise'];

    return (
        <div className="min-h-screen bg-white pricing-page-container">
            <style jsx global>{`
                @keyframes checkmark-pop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .checkmark-animate {
                    animation: checkmark-pop 0.3s ease-out forwards;
                }
                
                .pricing-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .pricing-card:hover {
                    transform: translateY(-8px);
                }
                
                .cta-button {
                    transition: all 0.2s ease-out;
                }
                
                .cta-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .pricing-page-container {
                    position: relative;
                    transition: background 0.6s ease;
                }

                .pricing-page-container::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 25%, rgba(255, 255, 255, 0) 60%, #ffffff 100%);
                    opacity: 0;
                    transition: opacity 0.6s ease;
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
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 30%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.6s ease;
                    pointer-events: none;
                    z-index: 0;
                }

                .pricing-page-container:hover::before,
                .pricing-page-container:hover::after {
                    opacity: 1;
                }

                .pricing-page-container > * {
                    position: relative;
                    z-index: 1;
                }
            `}</style>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        Choose Your AI Journey
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                        From curious explorer to enterprise powerhouse — find the perfect plan for your AI adoption stage
                    </p>

                    {/* Currency Toggle */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                            {(['USD', 'INR', 'EUR'] as Currency[]).map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => handleCurrencyChange(curr)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === curr
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
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
                                    pricing-card relative bg-white rounded-2xl overflow-hidden
                                    border-2 ${isCurrent ? plan.borderColor : 'border-gray-200'}
                                    ${isPopular ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 z-10' : ''}
                                    shadow-lg hover:shadow-2xl ${plan.glowColor}
                                `}
                            >
                                {/* Gradient Accent Bar */}
                                <div className={`h-2 bg-gradient-to-r ${plan.accentColor}`}></div>

                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute top-6 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-l-full shadow-lg">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrent && (
                                    <div className="absolute top-6 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                        ✓ CURRENT
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Icon */}
                                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.accentColor} mb-4 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.displayName}
                                    </h3>

                                    {/* Tagline */}
                                    <p className="text-sm text-gray-600 mb-6 min-h-[48px] italic">
                                        "{plan.tagline}"
                                    </p>

                                    {/* Price */}
                                    <div className="mb-6">
                                        {typeof plan.price === 'number' ? (
                                            <div>
                                                <div className="flex items-baseline">
                                                    <span className="text-4xl font-bold text-gray-900">
                                                        {formatPrice(plan)}
                                                    </span>
                                                    <span className="text-gray-600 ml-2">/month</span>
                                                </div>
                                                {plan.yearlyPrice && (
                                                    <div className="mt-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                                                        💰 Save 20% yearly (${plan.yearlyPrice}/mo)
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-bold text-gray-900">
                                                Contact Us
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSelectPlan(planKey)}
                                        disabled={isCurrent}
                                        className={`
                                            cta-button w-full py-3 px-6 rounded-xl font-semibold text-sm
                                            ${isCurrent
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : planKey === 'enterprise'
                                                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg'
                                                    : isPopular
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                                        : 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                                            }
                                        `}
                                    >
                                        {isCurrent ? '✓ Current Plan' : planKey === 'enterprise' ? '📞 Contact Sales' : planKey === 'free' ? '🚀 Start Free' : '⚡ Select Plan'}
                                    </button>

                                    {/* Prepaid Credits */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Model Credits</span>
                                            <span className="font-semibold text-gray-900">{plan.credits}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Agent Credits</span>
                                            <span className="font-semibold text-gray-900">{plan.agentCredits}</span>
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">✨ Key Features:</h4>
                                        <ul className="space-y-2.5">
                                            {plan.features.slice(0, expandedFeatures[planKey] ? undefined : 5).map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-700">
                                                    <Check className="checkmark-animate w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" style={{ animationDelay: `${idx * 50}ms` }} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Expand/Collapse */}
                                        {plan.features.length > 5 && (
                                            <button
                                                onClick={() => toggleFeatures(planKey)}
                                                className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium transition-colors"
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
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">🎧 Support</span>
                                            <span className="font-semibold text-gray-900">{plan.support}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Signals */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-12 shadow-inner">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-5xl mb-3">🎁</div>
                            <div className="text-2xl font-bold text-gray-900 mb-2">No Credit Card</div>
                            <p className="text-gray-600">Start free, upgrade when ready. No hidden fees.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-3">💎</div>
                            <div className="text-2xl font-bold text-gray-900 mb-2">Prepaid Credits</div>
                            <p className="text-gray-600">Predictable costs, transparent billing. No surprises.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-3">🛡️</div>
                            <div className="text-2xl font-bold text-gray-900 mb-2">Enterprise Security</div>
                            <p className="text-gray-600">GDPR, SOC2 compliant. Your data is safe with us.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Have Questions?</h3>
                    <p className="text-gray-600 mb-4">
                        Our team is here to help you find the perfect plan for your needs.
                    </p>
                    <a
                        href="mailto:support@speaksynth.ai"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors"
                    >
                        📧 Contact our team →
                    </a>
                </div>
            </div>
        </div>
    );
}
