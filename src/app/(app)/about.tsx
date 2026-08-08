import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Sparkles, Zap } from 'lucide-react-native';

export default function AboutScreen() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>The Last Glance App</Text>
                <Text style={styles.version}>v0.1.0 • Beta</Text>
            </View>

            {/* About */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Your last-minute revision vault.</Text>

                <Text style={styles.description}>
                    Keep your formulas, notes, images, screenshots, and other important
                    revision material in one place, ready when every minute counts.
                </Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
                <View style={styles.feature}>
                    <BookOpen size={22} color="#f9cf26" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Organize</Text>
                        <Text style={styles.featureDescription}>
                            Keep everything subject-wise.
                        </Text>
                    </View>
                </View>

                <View style={styles.feature}>
                    <Zap size={22} color="#f9cf26" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Quick Access</Text>
                        <Text style={styles.featureDescription}>
                            Find what you need in seconds.
                        </Text>
                    </View>
                </View>

                <View style={styles.feature}>
                    <Sparkles size={22} color="#f9cf26" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Your Revision</Text>
                        <Text style={styles.featureDescription}>
                            You decide what matters.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Creator Credit */}
            <View style={styles.credit}>
                <Image
                    source={require('../../../assets/shubh.png')}
                    style={styles.creatorImage}
                    resizeMode="contain"
                />

                <Text style={styles.builtBy}>Built by</Text>
                <Text style={styles.creatorName}>Shubhashish Chakraborty</Text>

                <Text style={styles.creatorTagline}>
                    shubhashish.me
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
    },

    content: {
        padding: 24,
        paddingTop: 50,
        paddingBottom: 40,
    },

    header: {
        alignItems: 'center',
        marginBottom: 28,
    },

    title: {
        color: '#f9cf26',
        fontSize: 28,
        fontWeight: '900',
    },

    version: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 5,
    },

    card: {
        backgroundColor: '#ffeacf',
        borderRadius: 22,
        padding: 22,
        marginBottom: 18,
    },

    cardTitle: {
        color: '#1c1c1c',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 10,
    },

    description: {
        color: '#1c1c1c',
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '600',
    },

    features: {
        gap: 10,
    },

    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#242424',
        borderRadius: 16,
        padding: 16,
    },

    featureText: {
        marginLeft: 14,
        flex: 1,
    },

    featureTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },

    featureDescription: {
        color: '#999',
        fontSize: 12,
        marginTop: 3,
    },

    credit: {
        alignItems: 'center',
        marginTop: 45,
    },

    creatorImage: {
        width: 180,
        height: 180,
        borderRadius: 36,
        marginBottom: 10,
    },

    builtBy: {
        color: '#777',
        fontSize: 12,
        fontWeight: '600',
    },

    creatorName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 3,
    },

    creatorTagline: {
        color: '#666',
        fontSize: 11,
        marginTop: 5,
    },
});