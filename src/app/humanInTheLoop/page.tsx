"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { langgraphService } from "@/services/langgraphService";
import { Thread } from "@/types/types";
import InterruptCard from "@/components/humanInTheLoop/InterruptCard";
import { RefreshCw, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HumanInTheLoopPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [interrupts, setInterrupts] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch interrupted threads
    const fetchInterrupts = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        try {
            const threads = await langgraphService.getInterruptedThreads();
            setInterrupts(threads);
        } catch (error) {
            console.error("Error fetching interrupts:", error);
        } finally {
            setIsLoading(false);
            if (showRefreshIndicator) setIsRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (!isAuthenticated) return;

        // Check if user is admin
        if (user?.role !== "admin") {
            router.push("/chat");
            return;
        }

        fetchInterrupts();

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            fetchInterrupts();
        }, 10000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user, router]);

    // Handle admin response
    const handleRespond = async (threadId: string, response: string, resolve: boolean) => {
        try {
            await langgraphService.resumeThread(threadId, resolve, response);
            // Remove from list immediately for better UX
            setInterrupts(prev => prev.filter(t => t.thread_id !== threadId));
        } catch (error) {
            console.error("Error sending response:", error);
            alert("Failed to send response. Please try again.");
        }
    };

    // Redirect non-authenticated users
    if (!isAuthenticated || !user) {
        return null;
    }

    // Redirect non-admins
    if (user.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Human-in-the-Loop</h1>
                            <p className="text-gray-400">Review user questions and provide assistance</p>
                        </div>
                    </div>

                    {/* Stats & Refresh */}
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
                            <span className="text-gray-400 text-sm">Pending:</span>
                            <span className="ml-2 text-white font-bold text-lg">{interrupts.length}</span>
                        </div>
                        <button
                            onClick={() => fetchInterrupts(true)}
                            disabled={isRefreshing}
                            className={`p items-center justify-center w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Refresh"
                        >
                            <RefreshCw className="text-gray-400" size={18} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <p className="text-gray-400 mt-4">Loading interrupts...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && interrupts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-gray-600" size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">All Clear!</h2>
                        <p className="text-gray-400">No pending approvals at the moment.</p>
                        <p className="text-gray-500 text-sm mt-2">This page auto-refreshes every 10 seconds</p>
                    </div>
                )}

                {/* Interrupt Cards */}
                {!isLoading && interrupts.length > 0 && (
                    <div className="space-y-4">
                        {interrupts.map(thread => (
                            <InterruptCard
                                key={thread.thread_id}
                                thread={thread}
                                onRespond={handleRespond}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
