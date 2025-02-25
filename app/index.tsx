import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Button, Card, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import React, { useEffect, useState, useCallback } from 'react';
import { Dropdown } from 'react-native-paper-dropdown';
import { fuelRecords } from '../lib/fuel-records';
import { vehicles } from '../lib/vehicles';
import { Vehicle, FuelRecord } from '../types/schema';

export default function Home() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [showDropDown, setShowDropDown] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await vehicles.list();
        setVehicleList(vehicleData);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // const Records = await fuelRecords.list(selectedVehicleId);
    } catch (error) {
      console.error('Failed to add fuel record:', error);
    }
    setTimeout(() => setRefreshing(false), 2000);
  }, [selectedVehicleId]);

  const [records, setRecords] = useState<FuelRecord[]>([]);
  
  useEffect(() => {
    const fetchRecords = async () => {
      if (selectedVehicleId) {
        const records = await fuelRecords.list(selectedVehicleId);
        setRecords(records);
      }
    };
    fetchRecords();
  }, [selectedVehicleId]);

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalSpent = records.reduce((sum, record) => sum + record.totalPrice, 0);
  const avgConsumption = records.reduce((sum, record) => sum + record.avgConsumption, 0) / (records.length || 1);
  const totalEstimatedDistance = sortedRecords.slice(0, -1).reduce((sum, record) => sum + record.estimatedDistanceKm, 0);
  const totalDistance = sortedRecords.length > 1 
    ? sortedRecords[sortedRecords.length - 1].odometer - sortedRecords[0].odometer
    : 0;
  const efficiency = totalDistance > 0 
    ? (( totalDistance / totalEstimatedDistance ) * 100)
    : '0';

  const chartData = sortedRecords.map(record => ({
    date: format(new Date(record.date), 'MMM d'),
    consumption: record.avgConsumption,
    price: record.pricePerLiter,
    range: record.estimatedDistanceKm
  }));

  const vehicleOptions = vehicleList?.length > 0 
    ? vehicleList.map(vehicle => ({
        label: vehicle.plate,
        value: vehicle.id,
      }))
    : [];

  const handleSelectVehicle = (value: string) => {
    setSelectedVehicleId(value);
    setShowDropDown(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
            Fuel Manager
          </Text>
          <Link href="/vehicle/register" asChild>
            <Button mode="contained">Add Vehicle</Button>
          </Link>
        </View>

        <Dropdown
          label="Select Vehicle"
          mode="outlined"
          value={selectedVehicleId}
          onSelect={() => handleSelectVehicle}
          options={vehicleOptions}
        />

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleMedium">Total Spent</Text>
              <Text variant="headlineMedium">Brr {totalSpent}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleMedium">Total Fuel</Text>
              <Text variant="headlineMedium">
                {records.reduce((sum, record) => sum + record.refillAmount, 0)}L
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleMedium">Est. Distance</Text>
              <Text variant="headlineMedium">
                {totalEstimatedDistance} km
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleMedium">Efficiency</Text>
              <Text variant="headlineMedium">{efficiency}%</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>Consumption, Range & Price Trends</Text>
            <LineChart
              data={{
                labels: chartData.map(d => d.date),
                datasets: [
                  {
                    data: chartData.map(d => d.consumption),
                    color: () => theme.colors.primary,
                  },
                  {
                    data: chartData.map(d => d.price),
                    color: () => theme.colors.secondary,
                  },
                  {
                    data: chartData.map(d => d.range),
                    color: () => theme.colors.tertiary,
                  }
                ],
              }}
              width={320}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 1,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: () => theme.colors.onBackground,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {records.length > 0 && (
          <Card style={styles.tableCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.chartTitle}>Recent Records</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title numeric>Odometer</DataTable.Title>
                  <DataTable.Title numeric>Est Range</DataTable.Title>
                  <DataTable.Title numeric>Refill</DataTable.Title>
                  <DataTable.Title numeric>L/100km</DataTable.Title>
                  <DataTable.Title numeric>Price/L</DataTable.Title>
                  <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>

                {sortedRecords.slice(-5).map((record) => (
                  <DataTable.Row key={record.id}>
                    <DataTable.Cell>
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{record.odometer} km</DataTable.Cell>
                    <DataTable.Cell numeric>
                      {record.currentEstimateKm} / {record.estimatedDistanceKm} km
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{record.refillAmount}L</DataTable.Cell>
                    <DataTable.Cell numeric>{record.avgConsumption}</DataTable.Cell>
                    <DataTable.Cell numeric>Brr {record.pricePerLiter}</DataTable.Cell>
                    <DataTable.Cell numeric>Brr {record.totalPrice}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {selectedVehicleId ? (
          <Link href={`/fuel/add?vehicleId=${selectedVehicleId}`} asChild>
            <Button
              mode="contained"
              style={styles.addButton}
              icon="plus"
            >
              Add Fuel Record
            </Button>
          </Link>
        ) : (
          <Button
            mode="contained"
            style={styles.addButton}
            icon="plus"
            disabled
          >
            Add Fuel Record
          </Button>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  chartCard: {
    marginBottom: 20,
  },
  chartTitle: {
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  addButton: {
    marginTop: 10,
  },
  tableCard: {
    marginBottom: 20,
  },
});
