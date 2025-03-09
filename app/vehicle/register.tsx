import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Vehicle } from '../../types/schema';
import { vehicles } from '../../lib/vehicles';
import { Alert } from 'react-native';

const currentYear = new Date().getFullYear();
const OPTIONS = [
  {label: 'Gasoline', value: 'Gasoline'},
  {label: 'Diesel', value: 'Diesel'},
  {label: 'Hybrid', value: 'Hybrid'},
  {label: 'Electric', value: 'Electric'},
  {label: 'Other', value: 'Other'}
]

const vehicleSchema = z.object({
  plate: z.string().min(1, 'License plate is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  engineType: z.enum(['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other']),
  yearOfMake: z.number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(currentYear, `Year must not be later than ${currentYear}`),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function VehicleRegistration() {
  const theme = useTheme();
  const [engine, setEngine] = useState<Vehicle['engineType']>();
  const { control, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      yearOfMake: currentYear,
      engineType: 'Gasoline',
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const newRecord = await vehicles.create(data);
      router.replace('/');
    } catch (error) {
      console.error('Vehicle registration error:', error);
      Alert.alert('Error', 'Failed to register vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Register Vehicle
        </Text>
        
        <View style={styles.form}>
          <Controller
            control={control}
            name="plate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="License Plate"
                value={value}
                onChangeText={onChange}
                error={!!errors.plate}
                style={styles.input}
              />
            )}
          />
          {errors.plate && (
            <Text style={styles.errorText}>{errors.plate.message}</Text>
          )}

          <Controller
            control={control}
            name="make"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Make"
                value={value}
                onChangeText={onChange}
                error={!!errors.make}
                style={styles.input}
              />
            )}
          />
          {errors.make && (
            <Text style={styles.errorText}>{errors.make.message}</Text>
          )}

          <Controller
            control={control}
            name="model"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Model"
                value={value}
                onChangeText={onChange}
                error={!!errors.model}
                style={styles.input}
              />
            )}
          />
          {errors.model && (
            <Text style={styles.errorText}>{errors.model.message}</Text>
          )}

          <Controller
            control={control}
            name="engineType"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                label="Engine Type"
                value={engine}
                onSelect={() => setEngine}
                options={OPTIONS}
                error={!!errors.engineType}
              />
            )}
          />
          {errors.engineType && (
            <Text style={styles.errorText}>{errors.engineType.message}</Text>
          )}

          <Controller
            control={control}
            name="yearOfMake"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Year of Manufacture"
                value={value.toString()}
                onChangeText={(text) => onChange(parseInt(text) || currentYear)}
                keyboardType="numeric"
                error={!!errors.yearOfMake}
                style={styles.input}
              />
            )}
          />
          {errors.yearOfMake && (
            <Text style={styles.errorText}>{errors.yearOfMake.message}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Register Vehicle
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },  
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 32,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -12,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    padding: 4
  },
});