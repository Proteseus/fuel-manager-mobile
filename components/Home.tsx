import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, useTheme, Button, Card, DataTable, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import React, { useEffect, useState, useCallback } from 'react';
import { Dropdown } from 'react-native-paper-dropdown';
import { fuelRecords } from '../lib/fuel-records';
import { vehicles } from '../lib/vehicles';
import { Vehicle, FuelRecord } from '../types/schema';

export function Home() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [showDropDown, setShowDropDown] = useState(false);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const { refresh } = useLocalSearchParams<{ refresh: string }>();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await vehicles.list();
        setVehicleList(vehicleData);
        if (vehicleData.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(vehicleData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (selectedVehicleId) {
        try {
          const records = await fuelRecords.list(selectedVehicleId);
          setRecords(records);
        } catch (error) {
          console.error('Failed to fetch records:', error);
        }
      }
    };
    fetchRecords();
  }, [selectedVehicleId, refresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedVehicleId) {
        const records = await fuelRecords.list(selectedVehicleId);
        setRecords(records);
      }
      const vehicleData = await vehicles.list();
      setVehicleList(vehicleData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
    setRefreshing(false);
  }, [selectedVehicleId]);

  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalSpent = records.reduce((sum, record) => sum + record.totalPrice, 0);
  const avgConsumption = records.reduce((sum, record) => sum + record.avgConsumption, 0) / (records.length || 1);
  const totalEstimatedDistance = sortedRecords.reduce((sum, record) => sum + record.estimatedDistanceKm, 0);
  const totalDistance = sortedRecords.length > 1 
    ? sortedRecords[0].odometer - sortedRecords[sortedRecords.length - 1].odometer
    : 0;
  const efficiency = totalDistance > 0 
    ? Math.round((totalDistance / totalEstimatedDistance) * 100)
    : 0;

  const chartData = sortedRecords.slice(0, 7).reverse().map(record => ({
    date: format(new Date(record.date), 'MMM d'),
    consumption: record.avgConsumption,
    price: record.pricePerLiter,
    range: record.estimatedDistanceKm
  }));

  const vehicleOptions = vehicleList.map(vehicle => ({
    label: `${vehicle.make} ${vehicle.model} (${vehicle.plate})`,
    value: vehicle.id,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.dropdownContainer}>
          <Dropdown
            label="Select Vehicle"
            mode="outlined"
            visible={showDropDown}
            showDropDown={() => setShowDropDown(true)}
            onDismiss={() => setShowDropDown(false)}
            value={selectedVehicleId}
            onSelect={setSelectedVehicleId}
            options={vehicleOptions}
          />
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium">Total Spent</Text>
              <Text variant="headlineMedium">Brr {totalSpent.toFixed(2)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium">Avg. Consumption</Text>
              <Text variant="headlineMedium">{avgConsumption.toFixed(1)} L/100km</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium">Distance</Text>
              <Text variant="headlineMedium">{totalDistance} km</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium">Efficiency</Text>
              <Text variant="headlineMedium">{efficiency}%</Text>
            </Card.Content>
          </Card>
        </View>

        {chartData.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.chartTitle}>Consumption Trend</Text>
              <LineChart
                data={{
                  labels: chartData.map(d => d.date),
                  datasets: [
                    {
                      data: chartData.map(d => d.consumption),
                      color: () => theme.colors.primary,
                      strokeWidth: 2,
                    }
                  ],
                }}
                width={Dimensions.get('window').width - 48}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.elevation.level1,
                  backgroundGradientFrom: theme.colors.elevation.level1,
                  backgroundGradientTo: theme.colors.elevation.level1,
                  decimalPlaces: 1,
                  color: (opacity = 1) => theme.colors.primary,
                  labelColor: () => theme.colors.onSurface,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: theme.colors.primary
                  }
                }}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {sortedRecords.length > 0 && (
          <Card style={styles.tableCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge">Recent Records</Text>
                {selectedVehicleId && (
                  <Link href={`/fuel/records/${selectedVehicleId}`} asChild>
                    <IconButton
                      icon="chevron-right"
                      mode="contained-tonal"
                      size={20}
                    />
                  </Link>
                )}
              </View>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title numeric>Odometer</DataTable.Title>
                  <DataTable.Title numeric>L/100km</DataTable.Title>
                  <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>

                {sortedRecords.slice(0, 5).map((record) => (
                  <DataTable.Row key={record.id}>
                    <DataTable.Cell>
                      {format(new Date(record.date), 'MMM d')}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{record.odometer}</DataTable.Cell>
                    <DataTable.Cell numeric>{record.avgConsumption.toFixed(1)}</DataTable.Cell>
                    <DataTable.Cell numeric>{record.totalPrice.toFixed(2)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Link href="/vehicle/register" asChild>
            <Button 
              mode="outlined" 
              icon="car"
              style={styles.button}
            >
              Add Vehicle
            </Button>
          </Link>

          {selectedVehicleId ? (
            <Link 
              href={{
                pathname: "/fuel/add",
                params: { vehicleId: selectedVehicleId }
              }} 
              asChild
            >
              <Button
                mode="contained"
                icon="gas-station"
                style={styles.button}
              >
                Add Fuel Record
              </Button>
            </Link>
          ) : (
            <Button
              mode="contained"
              icon="gas-station"
              disabled
              style={styles.button}
            >
              Add Fuel Record
            </Button>
          )}
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
  dropdownContainer: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    minWidth: '48%',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableCard: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});