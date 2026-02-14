'use client'

import { useState } from 'react'
import { Users, Activity, BarChart3, MessageSquare, Database, Mail } from 'lucide-react'

interface AdminTabsProps {
    overviewContent: React.ReactNode
    apiUsageContent: React.ReactNode
    usersContent: React.ReactNode
    supportContent: React.ReactNode
    newsletterContent: React.ReactNode
    maintenanceContent: React.ReactNode
}

type TabId = 'overview' | 'api-usage' | 'users' | 'support' | 'newsletter' | 'maintenance'

export function AdminTabs({ overviewContent, apiUsageContent, usersContent, supportContent, newsletterContent, maintenanceContent }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview')

    const tabs = [
        { id: 'overview' as TabId, label: 'Overview', icon: BarChart3 },
        { id: 'users' as TabId, label: 'Users', icon: Users },
        { id: 'newsletter' as TabId, label: 'Newsletter', icon: Mail },
        { id: 'support' as TabId, label: 'Support', icon: MessageSquare },
        { id: 'maintenance' as TabId, label: 'Maintenance', icon: Database },
        { id: 'api-usage' as TabId, label: 'API Usage', icon: Activity },
    ]

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-700">
                <nav className="flex space-x-1 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group relative min-w-0 flex-1 overflow-hidden 
                                    px-6 py-4 text-center text-sm font-semibold
                                    transition-all duration-200
                                    ${isActive
                                        ? 'text-white border-b-2 border-cyan-500'
                                        : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent hover:border-gray-600'
                                    }
                                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-500' : 'text-gray-400 group-hover:text-gray-200'}`} />
                                    <span>{tab.label}</span>
                                </div>

                                {/* Active indicator background */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 -z-10" />
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="animate-fadeIn">
                        {overviewContent}
                    </div>
                )}

                {activeTab === 'api-usage' && (
                    <div className="animate-fadeIn">
                        {apiUsageContent}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="animate-fadeIn">
                        {usersContent}
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="animate-fadeIn">
                        {supportContent}
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className="animate-fadeIn">
                        {newsletterContent}
                    </div>
                )}

                {activeTab === 'maintenance' && (
                    <div className="animate-fadeIn">
                        {maintenanceContent}
                    </div>
                )}
            </div>
        </div>
    )
}
