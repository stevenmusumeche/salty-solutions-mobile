import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSendFeedbackMutation } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { gray, red, white } from '../colors';

export const ContactScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [{ fetching }, sendFeedback] = useSendFeedbackMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const validate = () => {
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push('Name is required.');
    }

    if (!email.trim()) {
      errors.push('Email is required.');
    } else if (!validateEmail(email.trim())) {
      errors.push('Invalid email address.');
    }

    if (!subject.trim()) {
      errors.push('Subject is required.');
    }

    if (!message.trim()) {
      errors.push('Message is required.');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      Alert.alert(validationErrors.join(' '));
      return;
    }

    const errorMessage = 'There was an error sending your message.';
    try {
      const resp = await sendFeedback({
        input: {
          fromName: name,
          fromEmail: email,
          subject: subject,
          message: message,
        },
      });

      if (resp.error) {
        console.error(resp.error);
        Alert.alert(errorMessage);
        return;
      }

      if (resp.data?.sendFeedback.success === false) {
        Alert.alert(errorMessage);
        return;
      }

      Alert.alert('Thank you for your message!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert(errorMessage);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.row}>
        <Label>Name</Label>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.row}>
        <Label>Email</Label>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.row}>
        <Label>Subject</Label>
        <TextInput
          style={styles.textInput}
          value={subject}
          onChangeText={setSubject}
        />
      </View>
      <View style={[styles.row, { marginBottom: 30 }]}>
        <Label>Message</Label>
        <TextInput
          style={[styles.textInput, { minHeight: 300, maxHeight: 300 }]}
          value={message}
          onChangeText={setMessage}
          multiline={true}
        />
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            fetching ? { backgroundColor: gray[700] } : {},
          ]}
          onPress={handleSubmit}
          disabled={fetching}
        >
          {fetching ? (
            <ActivityIndicator color={white} />
          ) : (
            <Text
              style={{
                color: white,
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              Send Message
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const Label: React.FC = ({ children }) => {
  return (
    <View>
      <Text style={styles.label}>
        {children}
        <Text style={styles.asterisk}> *</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    flexGrow: 1,
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  asterisk: {
    color: red[700],
  },
  textInput: {
    borderColor: gray[300],
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
  },
  row: { marginBottom: 20 },
  button: {
    backgroundColor: gray[900],
    padding: 15,
    borderRadius: 8,
  },
});

function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
