'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

interface Warning {
    type: 'limit_reached' | 'approaching_limit' | 'trial_expiring' | 'trial_expired';
    resource?: string;
    message: string;
}

interface UsageData {
    usage: Record<string, number>;
    limits: Record<string, number>;
    warnings: Warning[];
    plan: string;
}

export default function UpgradeBanner() {
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsage();
        // Poll every 30 seconds
        const interval = setInterval(fetchUsage, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsage = async () => {
        try {
            const res = await fetch('/api/pricing/usage');
            const data = await res.json();
            setUsageData(data);
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !usageData || usageData.warnings.length === 0) {
        return null;
    }

    // Only show the highest priority warning that hasn't been dismissed
    const activeWarnings = usageData.warnings.filter(
        w => !dismissed.includes(w.message)
    );

    if (activeWarnings.length === 0) return null;

    const warning = activeWarnings[0];
    const isLimitReached = warning.type === 'limit_reached' || warning.type === 'trial_expired';

    const getBannerStyles = () => {
        if (isLimitReached) {
            return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
        }
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
    };

    const getIcon = () => {
        if (isLimitReached) {
            return <AlertCircle className="w-5 h-5" />;
        }
        return <Zap className="w-5 h-5" />;
    };

    const getUpgradeMessage = () => {
        if (usageData.plan === 'free' || usageData.plan === 'starter') {
            return 'Upgrade to Growth';
        }
        if (usageData.plan === 'growth') {
            return 'Upgrade to Pro';
        }
        return 'Upgrade Plan';
    };

    return (
        <div className={`${getBannerStyles()} shadow-lg border-b border-white/20`}>
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">
                                {warning.message}
                            </p>
                            {isLimitReached && (
                                <p className="text-xs opacity-90 mt-0.5">
                                    Your account has been temporarily restricted. Upgrade to continue using all features.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Usage Stats (compact) */}
                        {warning.resource && usageData.usage && usageData.limits && (
                            <div className="hidden md:block bg-white/20 rounded-lg px-3 py-1.5 text-xs font-medium">
                                {Math.round((usageData.usage[`${warning.resource}_used`] / usageData.limits[warning.resource]) * 100)}%
                                used
                            </div>
                        )}

                        {/* Upgrade Button */}
                        <Link href="/pricing">
                            <button className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-lg">
                                <Crown className="w-4 h-4" />
                                {getUpgradeMessage()}
                            </button>
                        </Link>

                        {/* Dismiss (only for warnings, not limits reached) */}
                        {!isLimitReached && (
                            <button
                                onClick={() => setDismissed([...dismissed, warning.message])}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Detailed breakdown for mobile */}
                {warning.resource && usageData.usage && usageData.limits && (
                    <div className="md:hidden mt-2 pt-2 border-t border-white/20">
                        <div className="flex justify-between text-xs">
                            <span className="opacity-90">
                                Used: {usageData.usage[`${warning.resource}_used`]} / {usageData.limits[warning.resource]}
                            </span>
                            <span className="font-semibold">
                                {Math.round((usageData.usage[`${warning.resource}_used`] / usageData.limits[warning.resource]) * 100)}%
                            </span>
                        </div>
                        <div className="mt-1.5 bg-white/20 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-white h-full transition-all duration-300"
                                style={{
                                    width: `${Math.min(100, (usageData.usage[`${warning.resource}_used`] / usageData.limits[warning.resource]) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
