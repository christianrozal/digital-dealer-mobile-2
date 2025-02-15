import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { INTEREST_STATUS_OPTIONS, INTEREST_IN_OPTIONS } from '../constants';

interface Filters {
  fromDate?: string;
  toDate?: string;
  interestStatus?: string[];
  interestedIn?: string[];
}

interface CustomersFilterProps {
  filters: Filters;
  onUpdateFilters: (filters: Filters) => void;
}

const CustomersFilter: React.FC<CustomersFilterProps> = ({ filters, onUpdateFilters }) => {
  const resetDateRange = () => {
    onUpdateFilters({
      ...filters,
      fromDate: dayjs().startOf('day').toISOString(),
      toDate: dayjs().endOf('day').toISOString()
    });
  };

  const toggleInterestStatus = (status: string) => {
    const currentStatuses = filters.interestStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onUpdateFilters({
      ...filters,
      interestStatus: newStatuses
    });
  };

  const toggleInterestIn = (interest: string) => {
    const currentInterests = filters.interestedIn || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    onUpdateFilters({
      ...filters,
      interestedIn: newInterests
    });
  };

  const resetInterestStatus = () => {
    onUpdateFilters({
      ...filters,
      interestStatus: []
    });
  };

  const resetInterestIn = () => {
    onUpdateFilters({
      ...filters,
      interestedIn: []
    });
  };

  const getStatusStyle = (status: string) => {
    const isSelected = (filters.interestStatus || []).includes(status);
    return {
      ...styles.filterButton,
      backgroundColor: isSelected ? '#007AFF' : '#F0F0F0'
    };
  };

  const getInterestStyle = (interest: string) => {
    const isSelected = (filters.interestedIn || []).includes(interest);
    return {
      ...styles.filterButton,
      backgroundColor: isSelected ? '#007AFF' : '#F0F0F0'
    };
  };

  const getTextStyle = (isSelected: boolean) => ({
    ...styles.filterText,
    color: isSelected ? '#FFFFFF' : '#000000'
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interest Status</Text>
          <TouchableOpacity onPress={resetInterestStatus}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          {INTEREST_STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={getStatusStyle(status)}
              onPress={() => toggleInterestStatus(status)}
            >
              <Text style={getTextStyle((filters.interestStatus || []).includes(status))}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interested In</Text>
          <TouchableOpacity onPress={resetInterestIn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          {INTEREST_IN_OPTIONS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={getInterestStyle(interest)}
              onPress={() => toggleInterestIn(interest)}
            >
              <Text style={getTextStyle((filters.interestedIn || []).includes(interest))}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  section: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  resetText: {
    color: '#007AFF',
    fontSize: 14
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  filterText: {
    fontSize: 14
  }
});

export default CustomersFilter; 