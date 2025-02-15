import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import CloseIcon from "./svg/closeIcon";
import Calendar2Icon from "./svg/calendar2";
import ButtonComponent from "./ui/button";
import CalendarFilter from "./calendarFilter";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface AnalyticsFilterProps {
  fromDate: string | null;
  toDate: string | null;
  onUpdateFilters: (fromDate: string | null, toDate: string | null) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

interface QuickFilterButton {
  label: string;
  getDateRange: () => { from: string; to: string };
}

const AnalyticsFilter = ({ fromDate, toDate, onUpdateFilters, onResetFilters, onClose }: AnalyticsFilterProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");
  const [tempFromDate, setTempFromDate] = useState<string | null>(fromDate);
  const [tempToDate, setTempToDate] = useState<string | null>(toDate);
  const [error, setError] = useState<string | null>(null);

  const quickFilters: QuickFilterButton[] = [
    {
      label: "Last 7 Days",
      getDateRange: () => ({
        from: dayjs().subtract(6, 'day').startOf('day').toISOString(),
        to: dayjs().endOf('day').toISOString()
      })
    },
    {
      label: "Last 30 Days",
      getDateRange: () => ({
        from: dayjs().subtract(29, 'day').startOf('day').toISOString(),
        to: dayjs().endOf('day').toISOString()
      })
    },
    {
      label: "This Week",
      getDateRange: () => ({
        from: dayjs().startOf('week').toISOString(),
        to: dayjs().endOf('day').toISOString()
      })
    },
    {
      label: "This Month",
      getDateRange: () => ({
        from: dayjs().startOf('month').toISOString(),
        to: dayjs().endOf('day').toISOString()
      })
    },
    {
      label: "Last Month",
      getDateRange: () => ({
        from: dayjs().subtract(1, 'month').startOf('month').toISOString(),
        to: dayjs().subtract(1, 'month').endOf('month').toISOString()
      })
    },
    {
      label: "This Year",
      getDateRange: () => ({
        from: dayjs().startOf('year').toISOString(),
        to: dayjs().endOf('day').toISOString()
      })
    }
  ];

  const handleQuickFilter = (filter: QuickFilterButton) => {
    try {
      const { from, to } = filter.getDateRange();
      setTempFromDate(from);
      setTempToDate(to);
      setError(null);
    } catch (error) {
      console.error('Error applying quick filter:', error);
      setError('Error applying quick filter');
    }
  };

  const isFilterSelected = (filter: QuickFilterButton) => {
    if (!tempFromDate || !tempToDate) return false;
    const { from, to } = filter.getDateRange();
    const selectedFrom = dayjs(tempFromDate);
    const selectedTo = dayjs(tempToDate);
    const filterFrom = dayjs(from);
    const filterTo = dayjs(to);
    
    return selectedFrom.isSame(filterFrom, 'day') && selectedTo.isSame(filterTo, 'day');
  };

  const handleCalendarClose = (date?: dayjs.Dayjs) => {
    if (date) {
      const isoDate = date.toISOString();
      if (selectingFor === "from") {
        if (tempToDate && date.isAfter(dayjs(tempToDate))) {
          setError('Start date cannot be after end date');
          return;
        }
        setTempFromDate(isoDate);
      } else {
        if (tempFromDate && date.isBefore(dayjs(tempFromDate))) {
          setError('End date cannot be before start date');
          return;
        }
        setTempToDate(isoDate);
      }
      setError(null);
    }
    setShowCalendar(false);
  };

  const handleApply = () => {
    if (error) return;
    onUpdateFilters(tempFromDate, tempToDate);
    onClose();
  };

  return showCalendar ? (
    <View className="flex-1 bg-white">
      <View className="h-full">
        <CalendarFilter
          onClose={handleCalendarClose}
          initialDate={
            selectingFor === "from"
              ? tempFromDate
                ? dayjs(tempFromDate)
                : undefined
              : tempToDate
              ? dayjs(tempToDate)
              : undefined
          }
          fromDate={tempFromDate ? dayjs(tempFromDate) : undefined}
          toDate={tempToDate ? dayjs(tempToDate) : undefined}
          selectingFor={selectingFor}
        />
      </View>
    </View>
  ) : (
    <View className="bg-white">
      <View className="h-full gap-3 justify-between">
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-semibold">Filters</Text>
              {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Quick Filters */}
          <View className="mt-5">
            <Text className="text-sm font-semibold">Quick Filters</Text>
            <View className="flex-row mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
              {quickFilters.map((filter, index) => {
                const isSelected = isFilterSelected(filter);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickFilter(filter)}
                    style={{ width: '31%', marginBottom: 8 }}
                    className={`border rounded-full p-2 items-center justify-center ${
                      isSelected ? 'bg-color1 border-color1' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'} text-center`}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Custom Date Range */}
          <View>
            <View className="flex-row gap-2 justify-between mt-8">
              <Text className="text-sm font-semibold">Custom Date Range</Text>
              <TouchableOpacity onPress={() => {
                setTempFromDate(null);
                setTempToDate(null);
                setError(null);
              }}>
                <Text className="text-color1 font-semibold text-sm">Reset</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-5 mt-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 font-medium">From</Text>
                <TouchableOpacity
                  className="mt-3 border border-gray-200 rounded-md px-3 py-2 flex-row justify-between items-center"
                  onPress={() => {
                    setSelectingFor("from");
                    setShowCalendar(true);
                  }}
                >
                  <Text className={`font-semibold text-xs ${tempFromDate ? 'text-color1' : 'text-gray-400'}`}>
                    {tempFromDate ? dayjs(tempFromDate).format("DD-MM-YYYY") : "Select date"}
                  </Text>
                  <Calendar2Icon width={20} height={20} />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 font-medium">To</Text>
                <TouchableOpacity
                  className="mt-3 border border-gray-200 rounded-md px-3 py-2 flex-row justify-between items-center"
                  onPress={() => {
                    setSelectingFor("to");
                    setShowCalendar(true);
                  }}
                >
                  <Text className={`font-semibold text-xs ${tempToDate ? 'text-color1' : 'text-gray-400'}`}>
                    {tempToDate ? dayjs(tempToDate).format("DD-MM-YYYY") : "Select date"}
                  </Text>
                  <Calendar2Icon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 w-full mt-5">
          <ButtonComponent
            label="Reset All"
            var2
            className="flex-1"
            onPress={() => {
              onResetFilters();
              onClose();
            }}
          />
          <ButtonComponent
            label="Apply Filters"
            className="flex-1"
            onPress={handleApply}
            disabled={!!error}
          />
        </View>
      </View>
    </View>
  );
};

export default AnalyticsFilter;