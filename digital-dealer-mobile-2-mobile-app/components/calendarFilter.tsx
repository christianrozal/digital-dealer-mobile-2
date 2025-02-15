// components/calendarFilter.tsx
import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import minMax from "dayjs/plugin/minMax";
import isBetween from "dayjs/plugin/isBetween";
import ChevronLeft from "@/components/svg/chevronLeft";
import ChevronRight from "./svg/chevronRight";
import CloseIcon from "@/components/svg/closeIcon";
import ButtonComponent from "./ui/button";

dayjs.extend(isoWeek);
dayjs.extend(minMax);
dayjs.extend(isBetween);

interface CalendarFilterProps {
  onClose: (date?: dayjs.Dayjs) => void;
  initialDate?: dayjs.Dayjs;
  fromDate?: dayjs.Dayjs;
  toDate?: dayjs.Dayjs;
  selectingFor: "from" | "to";
}

const CalendarFilter = ({ onClose, initialDate, fromDate, toDate, selectingFor }: CalendarFilterProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? initialDate.startOf("month") : dayjs().startOf("month")
  );
  const [selectedDate, setSelectedDate] = useState(initialDate || dayjs());
  const [error, setError] = useState<string | null>(null);

  const isDateValid = (date: dayjs.Dayjs) => {
    if (selectingFor === 'to' && fromDate) {
      return date.isSameOrAfter(fromDate, 'day');
    }
    return true;
  };

  const handleDateSelect = (date: dayjs.Dayjs) => {
    if (selectingFor === 'to' && fromDate && date.isBefore(fromDate, 'day')) {
      setError('End date cannot be before start date');
      return;
    }
    setError(null);
    setSelectedDate(date);
  };

  const handleApply = () => {
    if (error) return;
    onClose(selectedDate);
  };

  const generateCalendar = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const weeks = [];
    let currentDay = startOfMonth.startOf("isoWeek");

    while (currentDay.isBefore(endOfMonth.endOf("isoWeek"))) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push({
          date: currentDay.format("D"),
          isCurrentMonth: currentDay.month() === currentMonth.month(),
          dayjsDate: currentDay.clone() // Use clone() to avoid mutation
        });
        currentDay = currentDay.add(1, "day");
      }
      weeks.push(week);
    }

    return weeks;
  };

  const calendarWeeks = generateCalendar();

  const handlePreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  return (
    <View className="justify-between h-full gap-5">
      <View>
        {/* Close Header */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl">Select Date</Text>
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => onClose()}>
            <CloseIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Calendar Header */}
        <View className="flex-row justify-between items-center mb-8 mt-10">
          <View className="flex-row gap-3 items-center">
            <Text className="text-base font-bold">
              {currentMonth.format("MMMM YYYY")}
            </Text>
          </View>
          <View className="flex-row items-center gap-5">
            <TouchableOpacity onPress={handlePreviousMonth}>
              <ChevronLeft width={14} height={14} color="#3D12FA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight width={14} height={14} color="#3D12FA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Days Header */}
        <View className="flex-row justify-between mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} className="text-gray-500 text-xs flex-1 text-center">
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {calendarWeeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between mb-2">
              {week.map((day, dayIndex) => {
                const dayDate = day.dayjsDate;
                const isSelected = selectedDate.isSame(dayDate, "day");
                const isFromDate = fromDate?.isSame(dayDate, "day");
                const isToDate = toDate?.isSame(dayDate, "day");
                const isDisabled = !day.isCurrentMonth || (selectingFor === 'to' && fromDate && dayDate.isBefore(fromDate, 'day'));
                
                let isInRange = false;
                if (selectingFor === 'from' && toDate) {
                  const start = dayjs.min(selectedDate, toDate);
                  const end = dayjs.max(selectedDate, toDate);
                  isInRange = dayDate.isBetween(start, end, 'day', '[]');
                } else if (selectingFor === 'to' && fromDate) {
                  const start = dayjs.min(fromDate, selectedDate);
                  const end = dayjs.max(fromDate, selectedDate);
                  isInRange = dayDate.isBetween(start, end, 'day', '[]');
                }

                let bgStyles = {};
                let textStyle = {};
                if (isSelected) {
                  bgStyles = { backgroundColor: "rgba(61, 18, 250, 1)" };
                } else if (selectingFor === 'to' && isFromDate) {
                  bgStyles = { backgroundColor: "#C6D2FF"};
                  textStyle = { color: 'white' };
                } else if (selectingFor === 'from' && isToDate) {
                  bgStyles = { backgroundColor: "#C6D2FF"};
                  textStyle = { color: 'white' };
                }

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => handleDateSelect(dayDate)}
                    className="h-7 flex-1 items-center justify-center"
                    style={[
                      bgStyles,
                      { borderRadius: 9999, paddingVertical: 5 }
                    ]}
                    disabled={isDisabled}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? "text-white"
                          : isInRange && !isFromDate && !isToDate
                          ? "text-color1"
                          : isDisabled
                          ? "text-gray-300"
                          : day.isCurrentMonth
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                      style={textStyle}
                    >
                      {day.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Calendar Footer */}
      <View className="flex-row gap-3 w-full">
        <ButtonComponent label="Back" onPress={() => onClose()} var2 className="flex-1" />
        <ButtonComponent 
          label="Apply" 
          onPress={handleApply} 
          className="flex-1"
          disabled={!!error} 
        />
      </View>
    </View>
  );
};

export default CalendarFilter;
