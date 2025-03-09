import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { DatePickerModal, registerTranslation, en } from 'react-native-paper-dates';
import DatePicker from 'react-native-date-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { fuelRecords } from '@/lib/fuel-records';

// Register the locale
registerTranslation('en', en);

const fuelRecordSchema = z.object({
  date: z.string(),
  currentEstimateKm: z.number().min(0),
  odometer: z.number().min(0),
  avgConsumption: z.number().min(0),
  refillAmount: z.number().min(0),
  estimatedDistanceKm: z.number().min(0),
  pricePerLiter: z.number().min(0),
  totalPrice: z.number().min(0).optional()
});

type FuelRecordFormData = Omit<z.infer<typeof fuelRecordSchema>, 'totalPrice'> & { totalPrice?: number };

export default function AddFuelRecord() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const theme = useTheme();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params: { date: Date }) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );
  
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId);
  const { control, handleSubmit, formState: { errors } } = useForm<FuelRecordFormData>({
    resolver: zodResolver(fuelRecordSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      currentEstimateKm: 0,
      odometer: 0,
      avgConsumption: 0,
      refillAmount: 0,
      estimatedDistanceKm: 0,
      pricePerLiter: 0,
    },
  });

  const onSubmit = async (data: FuelRecordFormData) => {
    if (!selectedVehicleId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      const totalPrice = data.pricePerLiter * data.refillAmount;
      const formattedData = {
        ...data,
        date: date.toISOString().split('T')[0],
        totalPrice,
      };
      
      await fuelRecords.create(selectedVehicleId, formattedData);
      router.replace({
        pathname: '/',
        params: { refresh: Date.now() }
      });
    } catch (error) {
      console.error('Fuel record error:', error);
      Alert.alert('Error', 'Failed to save fuel record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Add Fuel Record
        </Text>
        
        <View style={styles.form}>
          {Object.keys(errors).length > 0 && (
            <Text style={styles.errorText}>
              {Object.values(errors)
                .map((error) => error.message)
                .join(', ')}
            </Text>
          )}
          <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
            {date ? date.toLocaleDateString() : 'Select Date'}
          </Button>
          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            onDismiss={onDismissSingle}
            date={date}
            onConfirm={(date) => {
              setOpen(false)
              setDate(date.date)
            }}
          />

          <Controller
            control={control}
            name="currentEstimateKm"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Current Range (km)"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.currentEstimateKm}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="odometer"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Odometer (km)"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.odometer}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="avgConsumption"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Average Consumption (L/100Km)"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.avgConsumption}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="refillAmount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Refill Amount (L)"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.refillAmount}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="estimatedDistanceKm"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Estimated Distance (Km)"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.estimatedDistanceKm}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="pricePerLiter"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Price per Liter"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.pricePerLiter}
                style={styles.input}
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Save Record
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
