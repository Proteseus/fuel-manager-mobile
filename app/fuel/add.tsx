import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { fuelRecords } from '@/lib/fuel-records';
import { Calendar } from 'lucide-react-native';

const fuelRecordSchema = z.object({
  date: z.string(),
  currentEstimateKm: z.number().min(0),
  odometer: z.number().min(0),
  avgConsumption: z.number().min(0),
  refillAmount: z.number().min(0),
  estimatedDistanceKm: z.number().min(0),
  pricePerLiter: z.number().min(0),
  totalPrice: z.number().min(0).optional()
}).refine((data) => data.pricePerLiter * data.refillAmount === data.totalPrice, {
  message: "Total price must be equal to price per liter * refill amount",
  path: ["totalPrice"],
});

type FuelRecordFormData = Omit<z.infer<typeof fuelRecordSchema>, 'totalPrice'> & { totalPrice?: number };

export default function AddFuelRecord() {
  const theme = useTheme();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [open, setOpen] = React.useState(false);

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
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
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
      console.error('No vehicle selected');
      return;
    }
    try {
      const totalPrice = data.pricePerLiter * data.refillAmount;
      const fuelRecord = await fuelRecords.create(selectedVehicleId, { ...data, totalPrice });
      console.log(data);
      router.back();
    } catch (error) {
      console.error('Fuel record error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Add Fuel Record
        </Text>
        
        <View style={styles.form}>
          <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
            {date ? date.toLocaleDateString() : 'Select Date'}
          </Button>
          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            onDismiss={onDismissSingle}
            date={date}
            onConfirm={onConfirmSingle}
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
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
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
  },
  button: {
    marginTop: 8,
  },
});
