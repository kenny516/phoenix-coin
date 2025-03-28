import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { updatePushToken } from '@/utils/notification';
import Toast from 'react-native-toast-message';
import { FirebaseError } from 'firebase/app';

export default function SignInScreen() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: ''
        };

        if (!email) {
            newErrors.email = 'L\'email est requis';
            isValid = false;
        } else if (!email.includes('@')) {
            newErrors.email = 'Email invalide';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Le mot de passe est requis';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const getFirebaseErrorMessage = (error: FirebaseError) => {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Adresse email invalide';
            case 'auth/user-disabled':
                return 'Ce compte a été désactivé';
            case 'auth/user-not-found':
                return 'Aucun compte trouvé avec cet email';
            case 'auth/wrong-password':
                return 'Mot de passe incorrect';
            case 'auth/too-many-requests':
                return 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
            case 'auth/network-request-failed':
                return 'Problème de connexion internet';
            default:
                return 'Veuillez verifier vos identifiants.';
        }
    };

    const handleSignIn = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            await updatePushToken();
            Toast.show({
                type: 'success',
                text1: 'Connexion réussie',
                text2: 'Bienvenue sur notre plateforme',
            });
            router.replace('/(tabs)/content/marche');
        } catch (error) {
            const firebaseError = error as FirebaseError;
            Toast.show({
                type: 'error',
                text1: 'Erreur de connexion',
                text2: getFirebaseErrorMessage(firebaseError),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#fff',
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}>
                <View className="justify-center flex-1 px-6 py-12">
                    <View className="items-center mb-10">
                        <FontAwesome5 name="phoenix-framework" size={50} color="#3B82F6" />
                        <Text className="text-3xl font-bold text-text-light">Bienvenue</Text>
                        <Text className="mt-2 text-text-muted">Connectez-vous pour continuer</Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="mb-2 font-medium text-text-light">Email</Text>
                            <View className="flex-row items-center px-4 border border-secondary-300 rounded-xl">
                                <Feather name="mail" size={20} color="text-muted" />
                                <TextInput
                                    className="flex-1 p-4 text-text-light"
                                    placeholder="Entrez votre email"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email ? <Text className="mt-1 text-red-500">{errors.email}</Text> : null}
                        </View>

                        <View>
                            <Text className="mb-2 font-medium text-text-light">Mot de passe</Text>
                            <View className="flex-row items-center px-4 border border-secondary-300 rounded-xl">
                                <Feather name="lock" size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 p-4"
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            {errors.password ? <Text className="mt-1 text-red-500">{errors.password}</Text> : null}
                        </View>
                        <TouchableOpacity
                            onPress={handleSignIn}
                            disabled={loading}
                            className="p-4 mt-4 bg-primary-500 rounded-xl">
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-lg font-semibold text-center text-white">
                                    Se connecter
                                </Text>
                            )}
                        </TouchableOpacity>
                        <View className="flex-row justify-center mt-4">
                            <Text className="text-text-muted">Vous n'avez pas de compte? </Text>
                            <Link href="/auth/sign-up" asChild>
                                <TouchableOpacity>
                                    <Text className="font-semibold text-primary-500">S'inscrire</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
