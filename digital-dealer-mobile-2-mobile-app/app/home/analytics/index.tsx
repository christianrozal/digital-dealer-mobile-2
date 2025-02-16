import { View, Text, TouchableOpacity, ScrollView, Modal, useWindowDimensions, RefreshControl } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import FilterIcon from "@/components/svg/filterIcon";
import { LineChart, PieChart } from "react-native-gifted-charts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import AnalyticsFilter from "@/components/analyticsFilter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/constants";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface CustomerStats {
  interestedIn: {
    Buying: number;
    Selling: number;
    Financing: number;
    Bought: number;
  };
  interestStatus: {
    Hot: number;
    Warm: number;
    Cold: number;
  };
  dailyScans: { [key: string]: number };
}

interface CustomerScan {
  id: number;
  customer_id: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  dealership_id: number;
  dealership_brand_id: number;
  dealership_department_id: number | null;
  interest_status: string;
  interested_in: string | null;
  follow_up_date: string | null;
  created_at: string;
}

interface UserData {
  id: number;
  email: string;
  role_id: number;
}

// Add AnalyticsScreenSkeleton component
const AnalyticsScreenSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white px-5"
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 80 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Analytics</Text>
          <View className="p-2">
            <FilterIcon showCircle={false} />
          </View>
        </View>

        {/* Date Range Skeleton */}
        <View className="flex-row justify-between mt-5">
          <View className="h-4 w-24 bg-color3 rounded" />
          <View className="h-4 w-16 bg-color3 rounded" />
        </View>

        {/* Line Chart Skeleton */}
        <View className="mt-5">
          <View className="bg-color3 p-3 rounded-md">
            <View className="h-4 w-16 bg-color3 rounded mx-auto" />
          </View>
          <View className="h-[150px] bg-color3/20 rounded-md mt-4" />
        </View>

        {/* Lead Status Distribution Skeleton */}
        <View className="mt-16">
          <View className="bg-color3 p-3 rounded-md">
            <View className="h-4 w-48 bg-color3 rounded mx-auto" />
          </View>
          <View className="mt-10 flex-row items-center justify-between">
            <View className="w-[140px] h-[140px] rounded-full bg-color3/20" />
            <View className="gap-3">
              {[1, 2, 3, 4].map((_, index) => (
                <View key={index} className="flex-row gap-3 items-center">
                  <View className="w-3 h-3 rounded-full bg-color3" />
                  <View className="h-3 w-20 bg-color3 rounded" />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Customer Interest Distribution Skeleton */}
        <View className="mt-16 mb-64">
          <View className="bg-color3 p-3 rounded-md">
            <View className="h-4 w-48 bg-color3 rounded mx-auto" />
          </View>
          <View className="mt-10 flex-row items-center justify-between">
            <View className="w-[140px] h-[140px] rounded-full bg-color3/20" />
            <View className="gap-3">
              {[1, 2, 3].map((_, index) => (
                <View key={index} className="flex-row gap-3 items-center">
                  <View className="w-3 h-3 rounded-full bg-color3" />
                  <View className="h-3 w-20 bg-color3 rounded" />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const AnalyticsScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [analyticsFromDate, setAnalyticsFromDate] = useState<string | null>(null);
  const [analyticsToDate, setAnalyticsToDate] = useState<string | null>(null);
  const [scans, setScans] = useState<CustomerScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load saved filters from AsyncStorage
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedFromDate = await AsyncStorage.getItem('analyticsFromDate');
        const savedToDate = await AsyncStorage.getItem('analyticsToDate');
        
        if (savedFromDate) setAnalyticsFromDate(savedFromDate);
        if (savedToDate) setAnalyticsToDate(savedToDate);
        
        fetchScans();
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadSavedFilters();
  }, []);

  // Fetch scans from the API
  const fetchScans = async () => {
    try {
      setLoading(true);
      
      // Get user data and dealership selection from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      const dealershipSelectionStr = await AsyncStorage.getItem('selectedDealership');
      const token = await AsyncStorage.getItem('userToken');
      
      if (!userDataStr || !dealershipSelectionStr || !token) {
        throw new Error('Missing required data');
      }

      const userData: UserData = JSON.parse(userDataStr);
      const dealershipSelection = JSON.parse(dealershipSelectionStr);

      // Fetch scans with filters
      const response = await axios.get(`${API_URL}/api/customer-scans/user/${userData.id}`, {
        params: {
          brandId: dealershipSelection.brand.id,
          departmentId: dealershipSelection.department?.id,
          fromDate: analyticsFromDate || dayjs().subtract(6, 'day').startOf('day').toISOString(),
          toDate: analyticsToDate || dayjs().endOf('day').toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setScans(response.data);
    } catch (error) {
      console.error('Error fetching scans:', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  // Get the date range text for display
  const getDateRangeText = useMemo(() => {
    if (!analyticsFromDate && !analyticsToDate) return "Last 7 days";

    const isFilterMatch = (filterFrom: dayjs.Dayjs, filterTo: dayjs.Dayjs) => {
      const selectedFrom = dayjs(analyticsFromDate);
      const selectedTo = dayjs(analyticsToDate);
      return selectedFrom.isSame(filterFrom, 'day') && selectedTo.isSame(filterTo, 'day');
    };

    // Check if it matches any quick filter
    const quickFilters = [
      {
        label: "Last 7 Days",
        getRange: () => ({
          from: dayjs().subtract(6, 'day').startOf('day'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "Last 30 Days",
        getRange: () => ({
          from: dayjs().subtract(29, 'day').startOf('day'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "This Week",
        getRange: () => ({
          from: dayjs().startOf('week'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "This Month",
        getRange: () => ({
          from: dayjs().startOf('month'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "Last Month",
        getRange: () => ({
          from: dayjs().subtract(1, 'month').startOf('month'),
          to: dayjs().subtract(1, 'month').endOf('month')
        })
      },
      {
        label: "This Year",
        getRange: () => ({
          from: dayjs().startOf('year'),
          to: dayjs().endOf('day')
        })
      }
    ];

    const matchingQuickFilter = quickFilters.find(filter => {
      const range = filter.getRange();
      return isFilterMatch(range.from, range.to);
    });

    if (matchingQuickFilter) {
      return matchingQuickFilter.label;
    }

    // If no quick filter matches, show the date range
    return `${dayjs(analyticsFromDate).format('D MMM')} - ${dayjs(analyticsToDate).format('D MMM')}`;
  }, [analyticsFromDate, analyticsToDate]);

  // Process the data to get statistics
  const stats = useMemo(() => {
    const initialStats: CustomerStats = {
      interestedIn: { Buying: 0, Selling: 0, Financing: 0, Bought: 0 },
      interestStatus: { Hot: 0, Warm: 0, Cold: 0 },
      dailyScans: {}
    };

    if (!scans.length) return initialStats;

    // If no filter is set, default to last 7 days
    const effectiveFromDate = analyticsFromDate || dayjs().subtract(6, 'day').startOf('day').toISOString();
    const effectiveToDate = analyticsToDate || dayjs().endOf('day').toISOString();

    // Process all scans for both charts
    scans.forEach(scan => {
      const scanDate = dayjs(scan.created_at);
      const isInRange = scanDate.isBetween(dayjs(effectiveFromDate), dayjs(effectiveToDate), 'day', '[]');
      
      if (!isInRange) return;

      // Track daily scans
      const scanDateStr = scanDate.format('YYYY-MM-DD');
      initialStats.dailyScans[scanDateStr] = (initialStats.dailyScans[scanDateStr] || 0) + 1;

      // Track interest and status for all scans
      if (scan.interested_in) {
        initialStats.interestedIn[scan.interested_in as keyof typeof initialStats.interestedIn] = 
          (initialStats.interestedIn[scan.interested_in as keyof typeof initialStats.interestedIn] || 0) + 1;
      }

      if (scan.interest_status) {
        initialStats.interestStatus[scan.interest_status as keyof typeof initialStats.interestStatus] = 
          (initialStats.interestStatus[scan.interest_status as keyof typeof initialStats.interestStatus] || 0) + 1;
      }
    });

    return initialStats;
  }, [scans, analyticsFromDate, analyticsToDate]);

  // Prepare data for charts
  const interestedInData = [
    { value: stats.interestedIn.Buying, color: '#8396FE', label: 'Buying' },
    { value: stats.interestedIn.Selling, color: '#B3A4F6', label: 'Selling' },
    { value: stats.interestedIn.Financing, color: '#8E72FF', label: 'Financing' },
    { value: stats.interestedIn.Bought, color: '#A0ABFF', label: 'Bought' }
  ];

  const interestStatusData = [
    { value: stats.interestStatus.Cold, color: '#8396FE', label: 'Cold' },
    { value: stats.interestStatus.Warm, color: '#B3A4F6', label: 'Warm' },
    { value: stats.interestStatus.Hot, color: '#8E72FF', label: 'Hot' }
  ];

  // Calculate totals
  const totalScans = useMemo(() => {
    const dailyScans = Object.values(stats.dailyScans);
    return dailyScans.reduce((sum: number, count) => {
      return sum + (typeof count === 'number' ? count : 0);
    }, 0);
  }, [stats.dailyScans]);

  const totalCustomers = interestedInData.reduce((sum, item) => sum + item.value, 0);
  const totalByStatus = interestStatusData.reduce((sum, item) => sum + item.value, 0);

  // Prepare line chart data
  const lineData = useMemo(() => {
    // Get the date range to display
    const fromDate = analyticsFromDate || dayjs().subtract(6, 'day').startOf('day').toISOString();
    const toDate = analyticsToDate || dayjs().endOf('day').toISOString();
    
    // Calculate number of days between dates
    const daysDiff = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;

    // Check if this is "This Year" filter
    const isThisYear = dayjs(fromDate).isSame(dayjs().startOf('year'), 'day') && 
                      dayjs(toDate).isSame(dayjs().endOf('day'), 'day');

    // For "This Year" or ranges > 90 days, group by month
    if (isThisYear || daysDiff > 90) {
      const monthData = new Map();
      
      // Initialize all months in the range
      let currentDate = dayjs(fromDate);
      while (currentDate.isSameOrBefore(dayjs(toDate), 'day')) {
        const monthStart = currentDate.startOf('month');
        const monthKey = monthStart.format('YYYY-MM');
        if (!monthData.has(monthKey)) {
          monthData.set(monthKey, {
            start: monthStart,
            count: 0
          });
        }
        currentDate = currentDate.add(1, 'day');
      }

      // Aggregate scan counts by month
      Object.entries(stats.dailyScans).forEach(([date, count]) => {
        const scanDate = dayjs(date);
        if (scanDate.isBetween(fromDate, toDate, 'day', '[]')) {
          const monthKey = scanDate.format('YYYY-MM');
          if (monthData.has(monthKey)) {
            monthData.get(monthKey).count += count;
          }
        }
      });

      return Array.from(monthData.values()).map(month => ({
        value: month.count,
        label: month.start.format('MMM'),
        dataPointText: month.count.toString()
      }));
    } else if (daysDiff >= 15) {
      // For ranges ≥ 15 days or "This Month", group by week
      const weekData = new Map();
      
      // Initialize all weeks in the range
      let currentDate = dayjs(fromDate);
      while (currentDate.isSameOrBefore(dayjs(toDate), 'day')) {
        const weekStart = currentDate.startOf('week');
        const weekKey = weekStart.format('YYYY-MM-DD');
        if (!weekData.has(weekKey)) {
          weekData.set(weekKey, {
            start: weekStart,
            end: weekStart.endOf('week'),
            count: 0
          });
        }
        currentDate = currentDate.add(1, 'day');
      }

      // Aggregate scan counts by week
      Object.entries(stats.dailyScans).forEach(([date, count]) => {
        const scanDate = dayjs(date);
        if (scanDate.isBetween(fromDate, toDate, 'day', '[]')) {
          const weekKey = scanDate.startOf('week').format('YYYY-MM-DD');
          if (weekData.has(weekKey)) {
            weekData.get(weekKey).count += count;
          }
        }
      });

      return Array.from(weekData.values()).map(week => ({
        value: week.count,
        label: `${week.start.format('D')}-${week.end.format('D MMM')}`,
        dataPointText: week.count.toString()
      }));
    }

    // For shorter ranges (< 15 days), show daily data
    const dates = Array.from({ length: daysDiff }, (_, i) => {
      return dayjs(fromDate).add(i, 'day').format('YYYY-MM-DD');
    });

    return dates.map(date => ({
      value: stats.dailyScans[date] || 0,
      label: dayjs(date).format('D MMM'),
      dataPointText: (stats.dailyScans[date] || 0).toString()
    }));
  }, [stats.dailyScans, analyticsFromDate, analyticsToDate]);

  // Check if there's any data
  const hasData = useMemo(() => {
    return lineData.some(item => item.value > 0);
  }, [lineData]);

  const handleFilterUpdate = async (fromDate: string | null, toDate: string | null) => {
    try {
      if (fromDate) await AsyncStorage.setItem('analyticsFromDate', fromDate);
      if (toDate) await AsyncStorage.setItem('analyticsToDate', toDate);
      
      setAnalyticsFromDate(fromDate);
      setAnalyticsToDate(toDate);
      fetchScans();
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const handleResetFilters = async () => {
    try {
      await AsyncStorage.removeItem('analyticsFromDate');
      await AsyncStorage.removeItem('analyticsToDate');
      
      setAnalyticsFromDate(null);
      setAnalyticsToDate(null);
      fetchScans();
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchScans().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return <AnalyticsScreenSkeleton />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 bg-white px-5" 
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3D12FA"
            colors={["#3D12FA"]}
          />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Analytics</Text>
          <TouchableOpacity className="p-2" onPress={() => setIsFilterVisible(true)}>
            <FilterIcon showCircle={analyticsFromDate !== null || analyticsToDate !== null} />
          </TouchableOpacity>
        </View>

        {/* Date Range */}
        <View className="flex-row justify-between rounded-md  mt-5">
          <Text className="text-xs font-bold">
            {getDateRangeText}
          </Text>
          <Text className="text-xs font-bold">
            <Text className="font-normal">Total Scans:</Text> {totalScans}
          </Text>
        </View>

        {/* Charts */}
        {hasData ? (
          <>
            {/* Line Chart */}
            <View className="mt-5 overflow-hidden">
              <View>
                <Text className="font-semibold mb-10 bg-color3 p-3 rounded-md w-full text-center">
                  Scans
                </Text>
                <LineChart
                  data={lineData}
                  height={150}
                  width={windowWidth - 40}
                  spacing={(windowWidth - 80) / Math.min(lineData.length, 12)}
                  thickness={2}
                  maxValue={Math.max(...lineData.map(d => d.value), 5) + 5}
                  noOfSections={5}
                  initialSpacing={20}
                  endSpacing={20}
                  dataPointsColor="#3D12FA"
                  dataPointsRadius={4}
                  textFontSize={10}
                  textShiftY={-12}
                  textShiftX={0}
                  showValuesAsDataPointsText
                  hideDataPoints={false}
                  adjustToWidth
                  rulesType="solid"
                  rulesColor="#E5E7EB"
                  xAxisColor="#E5E7EB"
                  yAxisColor="#E5E7EB"
                  yAxisTextStyle={{
                    color: '#4b5563',
                    fontSize: 12
                  }}
                  xAxisLabelTextStyle={{
                    color: '#4b5563',
                    fontSize: 10,
                    width: 50,
                    textAlign: 'center',
                    marginLeft: 0,
                    rotation: dayjs(analyticsToDate).diff(dayjs(analyticsFromDate), 'day') > 30 ? 45 : 0
                  }}
                  xAxisLabelsVerticalShift={3}
                  xAxisLabelsHeight={20}
                  hideRules={false}
                  focusEnabled
                  areaChart
                  color="#3D12FA"
                  startFillColor="rgba(61, 18, 250, 0.15)"
                  endFillColor="rgba(61, 18, 250, 0.01)"
                  startOpacity={0.9}
                  endOpacity={0.1}
                  textColor="#4b5563"
                  isAnimated
                  animationDuration={500}
                />
              </View>
            </View>

            {/* Lead Status Distribution */}
            <View className="mt-16 items-center">
              <Text className="font-semibold bg-color3 p-3 rounded-md w-full text-center">Lead Status Distribution</Text>
              <View className="mt-10 flex-row items-center gap-10">
                <PieChart
                  data={interestedInData}
                  donut
                  radius={70}  
                  innerRadius={57} 
                  centerLabelComponent={() => {
                    return <View>
                      <Text className="font-bold text-center text-2xl text-color1">{totalCustomers}</Text>
                      <Text className="font-medium text-gray-500 text-sm text-center">Total</Text>
                    </View>;
                  }}
                />
                <View className="gap-3">
                  {interestedInData.map((item, index) => (
                    <View key={index} className="flex-row gap-3 items-center">
                      <View className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}/>
                      <Text className="text-xs text-gray-500">
                        {item.label} <Text className="font-bold text-gray-600">{item.value}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Customer Interest Distribution */}
            <View className="mt-16 mb-16 items-center">
              <Text className="font-semibold bg-color3 p-3 rounded-md w-full text-center">Customer Interest Distribution</Text>
              <View className="mt-10 flex-row items-center gap-10">
                <PieChart
                  data={interestStatusData}
                  donut
                  radius={70}  
                  innerRadius={57} 
                  centerLabelComponent={() => {
                    return <View>
                      <Text className="font-bold text-2xl text-color1 text-center">{totalByStatus}</Text>
                      <Text className="font-medium text-gray-500 text-sm text-center">Total</Text>
                    </View>;
                  }}
                />
                <View className="gap-3">
                  {interestStatusData.map((item, index) => (
                    <View key={index} className="flex-row gap-3 items-center">
                      <View className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}/>
                      <Text className="text-xs text-gray-500">
                        {item.label} <Text className="font-bold text-gray-600">{item.value}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        ) : (
          <View className="h-[150px] items-center justify-center">
            <Text className="text-gray-500 text-sm">No scans recorded for this period</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/20 justify-end">
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setIsFilterVisible(false)}
          />
          <View className="bg-white h-[70%] rounded-t-2xl p-5">
            <AnalyticsFilter
              fromDate={analyticsFromDate}
              toDate={analyticsToDate}
              onUpdateFilters={handleFilterUpdate}
              onResetFilters={handleResetFilters}
              onClose={() => setIsFilterVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AnalyticsScreen;