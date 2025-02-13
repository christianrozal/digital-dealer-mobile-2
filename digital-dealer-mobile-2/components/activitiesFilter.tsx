import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import CloseIcon from "./svg/closeIcon";
import Calendar2Icon from "./svg/calendar2";
import Select from "@/components/ui/select";
import CalendarFilter from "./calendarFilter";
import ButtonComponent from "./ui/button";

export type SortOption = 
  | "a_to_z" 
  | "z_to_a" 
  | "scans_low_to_high" 
  | "scans_high_to_low" 
  | "last_scanned_newest_to_oldest" 
  | "last_scanned_oldest_to_newest";

export interface ActivityFilters {
  fromDate: string | null;
  toDate: string | null;
  sortBy: SortOption | null;
  interestedIn: string[];
  interestStatus: string[];
}

interface ActivitiesFilterProps {
  filters: ActivityFilters;
  onUpdateFilters: (newFilters: Partial<ActivityFilters>) => void;
  onResetFilters: () => void;
  onClose: () => void;
  variant?: 'activities' | 'customers';
}

const INTEREST_OPTIONS = [
  { value: "Buying", label: "Buying" },
  { value: "Selling", label: "Selling" },
  { value: "Financing", label: "Financing" },
  { value: "Bought", label: "Bought" },
];

const INTEREST_STATUS_OPTIONS = [
  { value: "Hot", label: "Hot" },
  { value: "Warm", label: "Warm" },
  { value: "Cold", label: "Cold" },
];

const ACTIVITIES_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "last_scanned_newest_to_oldest", label: "Last scanned (newest first)" },
  { value: "last_scanned_oldest_to_newest", label: "Last scanned (oldest first)" },
  { value: "a_to_z", label: "Name (A to Z)" },
  { value: "z_to_a", label: "Name (Z to A)" },
];

const CUSTOMERS_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "last_scanned_newest_to_oldest", label: "Latest scans first" },
  { value: "last_scanned_oldest_to_newest", label: "Oldest scans first" },
  { value: "a_to_z", label: "A to Z" },
  { value: "z_to_a", label: "Z to A" },
  { value: "scans_low_to_high", label: "Number of scans (lowest to highest)" },
  { value: "scans_high_to_low", label: "Number of scans (highest to lowest)" }
];

const ActivitiesFilter = ({ 
  filters, 
  onUpdateFilters, 
  onResetFilters, 
  onClose,
  variant = 'activities' 
}: ActivitiesFilterProps) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");
  const [tempFilters, setTempFilters] = useState<ActivityFilters>(filters);

  const SORT_OPTIONS = variant === 'activities' ? ACTIVITIES_SORT_OPTIONS : CUSTOMERS_SORT_OPTIONS;

  const filterCount = useMemo(() => {
    let count = 0;
    if (tempFilters.interestedIn.length > 0) count++;
    if (tempFilters.interestStatus.length > 0) count++;
    if (tempFilters.sortBy) count++;
    
    const isToday = 
      dayjs(tempFilters.fromDate).isSame(dayjs().startOf('day'), 'day') &&
      dayjs(tempFilters.toDate).isSame(dayjs().endOf('day'), 'day');
    
    if (tempFilters.fromDate || tempFilters.toDate) {
      if (!isToday) count++;
    }
    
    return count;
  }, [tempFilters]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const getInterestOptionStyle = (value: string) => {
    const isSelected = tempFilters.interestedIn.includes(value);
    switch (value) {
      case "Buying":
        return isSelected ? "border-green-400 bg-green-100" : "border-gray-200";
      case "Selling":
        return isSelected ? "border-blue-400 bg-blue-100" : "border-gray-200";
      case "Financing":
        return isSelected ? "border-pink-400 bg-pink-100" : "border-gray-200";
      case "Bought":
        return isSelected ? "border-violet-400 bg-violet-100" : "border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const getStatusOptionStyle = (value: string) => {
    const isSelected = tempFilters.interestStatus.includes(value);
    switch (value) {
      case "Hot":
        return isSelected ? "border-red-400 bg-red-100" : "border-gray-200";
      case "Warm":
        return isSelected ? "border-orange-400 bg-orange-100" : "border-gray-200";
      case "Cold":
        return isSelected ? "border-gray-400 bg-gray-100" : "border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const getInterestTextStyle = (value: string) => {
    const isSelected = tempFilters.interestedIn.includes(value);
    switch (value) {
      case "Buying":
        return isSelected ? "text-green-600" : "text-gray-400";
      case "Selling":
        return isSelected ? "text-blue-600" : "text-gray-400";
      case "Financing":
        return isSelected ? "text-pink-600" : "text-gray-400";
      case "Bought":
        return isSelected ? "text-violet-600" : "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusTextStyle = (value: string) => {
    const isSelected = tempFilters.interestStatus.includes(value);
    switch (value) {
      case "Hot":
        return isSelected ? "text-red-600" : "text-gray-400";
      case "Warm":
        return isSelected ? "text-orange-600" : "text-gray-400";
      case "Cold":
        return isSelected ? "text-gray-600" : "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const toggleInterestIn = (value: string) => {
    const newInterestedIn = tempFilters.interestedIn.includes(value)
      ? tempFilters.interestedIn.filter(v => v !== value)
      : [...tempFilters.interestedIn, value];
    setTempFilters(prev => ({ ...prev, interestedIn: newInterestedIn }));
  };

  const toggleInterestStatus = (value: string) => {
    const newInterestStatus = tempFilters.interestStatus.includes(value)
      ? tempFilters.interestStatus.filter(v => v !== value)
      : [...tempFilters.interestStatus, value];
    setTempFilters(prev => ({ ...prev, interestStatus: newInterestStatus }));
  };

  const resetInterestIn = () => {
    setTempFilters(prev => ({ ...prev, interestedIn: [] }));
  };

  const resetInterestStatus = () => {
    setTempFilters(prev => ({ ...prev, interestStatus: [] }));
  };

  const resetDateRange = () => {
    setTempFilters(prev => ({ 
      ...prev,
      fromDate: dayjs().startOf('day').toISOString(), 
      toDate: dayjs().endOf('day').toISOString() 
    }));
  };

  return showCalendar ? (
    <View className="flex-1 bg-white">
      <View className="h-full">
        <CalendarFilter
          onClose={(date) => {
            if (date) {
              const isoDate = date.toISOString();
              setTempFilters(prev => ({
                ...prev,
                [selectingFor === "from" ? "fromDate" : "toDate"]: isoDate,
              }));
            }
            setShowCalendar(false);
          }}
          initialDate={
            selectingFor === "from"
              ? tempFilters.fromDate
                ? dayjs(tempFilters.fromDate)
                : undefined
              : tempFilters.toDate
              ? dayjs(tempFilters.toDate)
              : undefined
          }
          fromDate={tempFilters.fromDate ? dayjs(tempFilters.fromDate) : undefined}
          toDate={tempFilters.toDate ? dayjs(tempFilters.toDate) : undefined}
          selectingFor={selectingFor}
        />
      </View>
    </View>
  ) : (
    <View className="bg-white">
      <View className="h-full gap-3 justify-between">
        <View>
          {/* Created On Filter */}
          <View>
            <View className="flex-row gap-2 justify-between">
              <Text className="text-sm font-semibold">Created On</Text>
              <TouchableOpacity onPress={resetDateRange}>
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
                  <Text className="text-gray-700 font-semibold text-xs">
                    {tempFilters.fromDate ? dayjs(tempFilters.fromDate).format("DD-MM-YYYY") : "Select date"}
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
                  <Text className="text-gray-700 font-semibold text-xs">
                    {tempFilters.toDate ? dayjs(tempFilters.toDate).format("DD-MM-YYYY") : "Select date"}
                  </Text>
                  <Calendar2Icon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort By Filter */}
            <View className="mt-4 relative z-10">
              <Text className="text-xs text-gray-600 font-medium mb-2">Sort By</Text>
              <Select
                placeholder="Select sort option"
                value={
                  tempFilters.sortBy
                    ? {
                        id: tempFilters.sortBy,
                        label: SORT_OPTIONS.find((o) => o.value === tempFilters.sortBy)?.label || "",
                      }
                    : null
                }
                options={SORT_OPTIONS.map((option) => ({
                  id: option.value,
                  label: option.label,
                }))}
                isOpen={isSortDropdownOpen}
                onPress={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                onSelect={(option) => {
                  setTempFilters(prev => ({ ...prev, sortBy: option ? (option.id as SortOption) : null }));
                  setIsSortDropdownOpen(false);
                }}
              />
            </View>

            {/* Interested In Filter */}
            <View className="mt-4">
              <Text className="text-xs text-gray-600 font-medium">Interested In</Text>
              <View className="flex-row justify-between gap-2 items-center" style={{ paddingRight: 12 }}>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {INTEREST_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => toggleInterestIn(option.value)}
                      className={`rounded-full border px-3 ${getInterestOptionStyle(option.value)}`}
                      style={{ paddingVertical: 6 }}
                    >
                      <Text className={`text-xs font-normal ${getInterestTextStyle(option.value)}`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {tempFilters.interestedIn.length > 0 && (
                  <TouchableOpacity onPress={resetInterestIn}>
                    <CloseIcon width={16} height={16} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Interest Status Filter */}
            <View className="mt-4">
              <Text className="text-xs text-gray-600 font-medium">Interest Status</Text>
              <View className="flex-row justify-between gap-2 items-center" style={{ paddingRight: 12 }}>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {INTEREST_STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => toggleInterestStatus(option.value)}
                      className={`rounded-full border px-3 ${getStatusOptionStyle(option.value)}`}
                      style={{ paddingVertical: 6 }}
                    >
                      <Text className={`text-xs font-normal ${getStatusTextStyle(option.value)}`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {tempFilters.interestStatus.length > 0 && (
                  <TouchableOpacity onPress={resetInterestStatus}>
                    <CloseIcon width={16} height={16} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 w-full">
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
            label={`Apply Filters (${filterCount})`}
            className="flex-1"
            onPress={() => {
              onUpdateFilters(tempFilters);
              onClose();
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default ActivitiesFilter;