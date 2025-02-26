import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, DataTable, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import React, { useEffect, useState, useCallback } from 'react';
import { fuelRecords } from '../../../lib/fuel-records';
import { vehicles } from '../../../lib/vehicles';
import { FuelRecord, Vehicle } from '../../../types/schema';

export default function FuelRecords() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsData, vehicleData] = await Promise.all([
          fuelRecords.list(id),
          vehicles.get(id)
        ]);
        setRecords(recordsData);
        setVehicle(vehicleData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const records = await fuelRecords.list(id);
      setRecords(records);
    } catch (error) {
      console.error('Failed to refresh records:', error);
    }
    setRefreshing(false);
  }, [id]);

  const filteredRecords = records
    .filter(record => 
      format(new Date(record.date), 'MMM d, yyyy').toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.odometer.toString().includes(searchQuery) ||
      record.avgConsumption.toString().includes(searchQuery) ||
      record.totalPrice.toString().includes(searchQuery)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {vehicle && (
          <Text variant="titleLarge" style={styles.vehicleTitle}>
            {vehicle.make} {vehicle.model} ({vehicle.plate})
          </Text>
        )}

        <Searchbar
          placeholder="Search records"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Date</DataTable.Title>
            <DataTable.Title numeric>Odometer</DataTable.Title>
            <DataTable.Title numeric>Range</DataTable.Title>
            <DataTable.Title numeric>Refill</DataTable.Title>
            <DataTable.Title numeric>L/100km</DataTable.Title>
            <DataTable.Title numeric>Price/L</DataTable.Title>
            <DataTable.Title numeric>Total</DataTable.Title>
          </DataTable.Header>

          {filteredRecords.map((record) => (
            <DataTable.Row key={record.id}>
              <DataTable.Cell>
                {format(new Date(record.date), 'MMM d, yyyy')}
              </DataTable.Cell>
              <DataTable.Cell numeric>{record.odometer}</DataTable.Cell>
              <DataTable.Cell numeric>
                {record.estimatedDistanceKm}
              </DataTable.Cell>
              <DataTable.Cell numeric>{record.refillAmount}L</DataTable.Cell>
              <DataTable.Cell numeric>{record.avgConsumption.toFixed(1)}</DataTable.Cell>
              <DataTable.Cell numeric>{record.pricePerLiter.toFixed(2)}</DataTable.Cell>
              <DataTable.Cell numeric>{record.totalPrice.toFixed(2)}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
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
  vehicleTitle: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
});