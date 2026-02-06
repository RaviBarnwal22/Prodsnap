import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Briefcase, BarChart3, TrendingUp, Cpu, Rocket, Users, Search, Calculator, ChevronLeft, ArrowRight } from 'lucide-react-native';

const CATEGORIES = [
    { id: 'DESIGN', label: 'Product Design', icon: Briefcase, color: '#3b82f6', count: 24 },
    { id: 'METRICS', label: 'Success Metrics', icon: BarChart3, color: '#8b5cf6', count: 18 },
    { id: 'GROWTH', label: 'Growth Strategy', icon: TrendingUp, color: '#f97316', count: 15 },
    { id: 'TECH', label: 'Tech Acumen', icon: Cpu, color: '#06b6d4', count: 12 },
    { id: 'GTM', label: 'Go-to-Market', icon: Rocket, color: '#ec4899', count: 10 },
    { id: 'BEHAVIORAL', label: 'Behavioral', icon: Users, color: '#6366f1', count: 20 },
    { id: 'RCA', label: 'Root Cause', icon: Search, color: '#ef4444', count: 8 },
    { id: 'ESTIMATE', label: 'Guesstimates', icon: Calculator, color: '#10b981', count: 14 },
];

export default function Tracks({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Learning <Text style={styles.accent}>Tracks</Text></Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.card}
                        onPress={() => navigation.navigate('Practice', { category: cat.id })}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                            <cat.icon color={cat.color} size={28} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardLabel}>{cat.label}</Text>
                            <Text style={styles.cardSubtext}>{cat.count} Specialized Cases</Text>
                        </View>
                        <ArrowRight color="#334155" size={20} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    accent: {
        color: '#3b82f6',
    },
    list: {
        padding: 20,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#111827',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtext: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
});
