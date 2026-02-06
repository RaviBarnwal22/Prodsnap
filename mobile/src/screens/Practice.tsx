import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Mic, Send, Info, User, Bot, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Practice({ route, navigation }: any) {
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'assistant', text: "Hello! I'm your AI interviewer. For this design case, how would you approach the 'Comprehend' stage for Spotify's Gen-Z users?" }
    ]);

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Logic for actual recording would go here
    };

    const handleSend = () => {
        if (!message.trim()) return;
        setChat([...chat, { role: 'user', text: message }]);
        setMessage('');
        // Mock response
        setTimeout(() => {
            setChat(prev => [...prev, { role: 'assistant', text: "That's a solid start. Which specific user segment within Gen-Z should we prioritize?" }]);
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Top Navigation */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>Spotify Home Design</Text>
                        <View style={styles.liveBadge}>
                            <View style={styles.pulse} />
                            <Text style={styles.liveText}>INTERVIEW LIVE</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.infoButton}>
                        <Info color="#64748b" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Chat Interface */}
                <ScrollView
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {chat.map((msg, idx) => (
                        <View key={idx} style={[
                            styles.messageWrapper,
                            msg.role === 'user' ? styles.userWrapper : styles.botWrapper
                        ]}>
                            <View style={styles.avatar}>
                                {msg.role === 'user' ? <User size={16} color="#64748b" /> : <Bot size={16} color="#3b82f6" />}
                            </View>
                            <View style={[
                                styles.messageBubble,
                                msg.role === 'user' ? styles.userBubble : styles.botBubble
                            ]}>
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Interaction Area */}
                <View style={styles.interactionArea}>
                    {isRecording ? (
                        <View style={styles.recordingState}>
                            <Text style={styles.recordingText}>Listening to your logic...</Text>
                            <View style={styles.waveContainer}>
                                {/* Visual wave could go here */}
                                <View style={[styles.wave, { height: 20 }]} />
                                <View style={[styles.wave, { height: 40 }]} />
                                <View style={[styles.wave, { height: 30 }]} />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your answer..."
                                placeholderTextColor="#64748b"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                <Send color="#fff" size={20} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Large Mic Toggle */}
                    <TouchableOpacity
                        onPress={toggleRecording}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isRecording ? ['#ef4444', '#dc2626'] : ['#7c3aed', '#2563eb']}
                            style={styles.micButton}
                        >
                            <Mic color="#fff" size={32} />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.micInstruction}>{isRecording ? "Tap to Stop" : "Tap to Speak your Logic"}</Text>
                </View>
            </KeyboardAvoidingView>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    pulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
        marginRight: 6,
    },
    liveText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    infoButton: {
        padding: 8,
    },
    chatContainer: {
        flex: 1,
    },
    chatScroll: {
        padding: 20,
        paddingBottom: 40,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 24,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    botWrapper: {
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    messageBubble: {
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 12,
    },
    userBubble: {
        backgroundColor: '#2563eb',
        borderTopRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    interactionArea: {
        padding: 20,
        paddingTop: 10,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
        alignItems: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#111827',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        width: '100%',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    micInstruction: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    recordingState: {
        alignItems: 'center',
        marginBottom: 20,
    },
    recordingText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 10,
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    wave: {
        width: 4,
        backgroundColor: '#ef4444',
        borderRadius: 2,
    }
});
