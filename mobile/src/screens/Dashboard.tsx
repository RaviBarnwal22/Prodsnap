import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Trophy, Flame, ChevronRight, Activity, Layout } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello, Candidate</Text>
                        <Text style={styles.brandTitle}>Prod<Text style={styles.accentText}>snap</Text></Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>JD</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Skill Radar Section (Glassmorphism) */}
                <View style={styles.radarCard}>
                    <View style={styles.radarHeader}>
                        <Text style={styles.radarTitle}>Skill Matrix</Text>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreText}>82/100</Text>
                        </View>
                    </View>

                    <View style={styles.radarPlaceholder}>
                        <Activity size={180} color="#7c3aed" opacity={0.3} />
                        <View style={styles.centerNode}>
                            <Text style={styles.nodeText}>82</Text>
                        </View>
                    </View>

                    <View style={styles.skillLabels}>
                        <Text style={styles.label}>Strategy</Text>
                        <Text style={styles.label}>Execution</Text>
                        <Text style={styles.label}>Design</Text>
                        <Text style={styles.label}>Analytics</Text>
                    </View>
                </View>

                {/* Daily Challenge Card (Gradient) */}
                <LinearGradient
                    colors={['#7c3aed', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.challengeCard}
                >
                    <View style={styles.challengeHeader}>
                        <Sparkles size={20} color="#fff" />
                        <Text style={styles.challengeTag}>DAILY CHALLENGE</Text>
                    </View>
                    <Text style={styles.challengeTitle}>The Spotify App Experience</Text>
                    <Text style={styles.challengeDesc}>
                        How would you improve the music discovery experience for Gen-Z users?
                    </Text>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => navigation.navigate('Practice', { id: 'daily-premium' })}
                    >
                        <Text style={styles.startButtonText}>Start Practice</Text>
                        <ChevronRight size={18} color="#2563eb" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Explore Tracks Button */}
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate('Tracks')}
                >
                    <Text style={styles.exploreButtonText}>Explore All Tracks</Text>
                    <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Flame size={20} color="#f97316" />
                        <Text style={styles.statValue}>12 Days</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Trophy size={20} color="#eab308" />
                        <Text style={styles.statValue}>4,500</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Layout size={20} color="#06b6d4" />
                        <Text style={styles.statValue}>Lv. 4</Text>
                        <Text style={styles.statLabel}>Strategist</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    welcomeText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    brandTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
    },
    accentText: {
        color: '#3b82f6',
    },
    profileButton: {},
    avatarPlaceholder: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatarText: {
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    radarCard: {
        backgroundColor: '#111827',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 20,
    },
    radarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    radarTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    scoreBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreText: {
        color: '#a78bfa',
        fontWeight: 'bold',
        fontSize: 10,
    },
    radarPlaceholder: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerNode: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#111827',
        borderWidth: 2,
        borderColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nodeText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },
    skillLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    label: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    challengeCard: {
        borderRadius: 30,
        padding: 24,
        marginBottom: 20,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    challengeTag: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    challengeTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    challengeDesc: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    startButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 8,
    },
    startButtonText: {
        color: '#2563eb',
        fontWeight: '900',
        fontSize: 16,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#1e293b',
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        height: 100,
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 4,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    }
});
