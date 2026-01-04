import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../theme/theme-context';
import { useGoals, useWeeklyGoalStats } from '../../../hooks/use-goals';
import { Goal, UserGoal, goalService } from '../../../services/goal.service';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LineChart } from 'react-native-gifted-charts';
import { toast } from '../../../utils/toast';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const { colors, isDark, mode, setMode } = useTheme();
  const queryClient = useQueryClient();
  const {
    goals,
    goalsTotal,
    isLoading,
    myGoals,
    isLoadingMyGoals,
    todayProgress,
    joinGoal,
    isJoining,
    leaveGoal,
    isLeaving,
    updateProgress,
    isUpdatingProgress,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchGoals,
  } = useGoals();

  const { dailyStats, isLoading: isLoadingStats, totalGoals } = useWeeklyGoalStats(myGoals);

  const [activeTab, setActiveTab] = useState<'available' | 'myGoals'>('myGoals');
  const [refreshing, setRefreshing] = useState(false);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    // Force refetch all goal-related queries
    await Promise.all([
      refetchGoals(),
      queryClient.refetchQueries({ queryKey: ['myGoals'] }),
      queryClient.refetchQueries({ queryKey: ['todayProgress'] }),
    ]);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && activeTab === 'available') {
      fetchNextPage();
    }
  };

  const isGoalJoined = (goalId: string): boolean => {
    return myGoals.some((ug) => {
      const goal = typeof ug.goalId === 'object' ? ug.goalId._id : ug.goalId;
      return goal === goalId;
    });
  };

  // Update completed goals when todayProgress changes
  useEffect(() => {
    if (!todayProgress || !Array.isArray(todayProgress)) {
      setCompletedGoals(new Set());
      return;
    }

    const completed = new Set<string>();
    todayProgress.forEach((p) => {
      if (p && p.completed) {
        const gId = typeof p.goalId === 'object' ? p.goalId._id : p.goalId;
        completed.add(gId);
      }
    });
    setCompletedGoals(completed);
  }, [todayProgress]);

  const getTodayProgress = (goalId: string): boolean => {
    // Check local state first (immediate update)
    if (completedGoals.has(goalId)) {
      return true;
    }
    // Then check from API data
    if (!todayProgress || !Array.isArray(todayProgress)) {
      return false;
    }
    const progress = todayProgress.find((p) => {
      if (!p) return false;
      const gId = typeof p.goalId === 'object' ? p.goalId._id : p.goalId;
      return gId === goalId;
    });
    return progress?.completed || false;
  };

  const handleJoinGoal = async (goalId: string) => {
    try {
      await joinGoal(goalId);
      toast.success('You have successfully joined this goal! 🎯');
    } catch (error: any) {
      console.error('Failed to join goal:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to join goal. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleLeaveGoal = async (goalId: string) => {
    try {
      await leaveGoal(goalId);
      toast.success('You have left this goal.');
    } catch (error: any) {
      console.error('Failed to leave goal:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to leave goal. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleMarkCompleted = async (goalId: string) => {
    try {
      // Immediately update local state to hide button
      setCompletedGoals(prev => new Set(prev).add(goalId));
      
      // Get today's date in local timezone (YYYY-MM-DD format)
      // This ensures we're using the same date regardless of timezone
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayISO = `${year}-${month}-${day}`;
      
      // Get goal info to check points
      const goal = goals.find(g => g._id === goalId);
      const points = goal?.points || 0;
      
      // Update progress
      await updateProgress({
        goalId,
        data: { completed: true, date: todayISO },
      });
      
      // Check if goal was fully completed (all days) to award points
      try {
        const completionStatus = await goalService.getGoalCompletionStatus(goalId);
        
        if (completionStatus.isCompleted && completionStatus.pointsAwarded && points > 0) {
          toast.success(
            `Congratulations! You've completed this goal and earned ${points} points! 🎉`,
            'Goal Completed!'
          );
        } else {
          toast.success('Goal marked as completed for today! 🎉');
        }
      } catch (statusError) {
        // If status check fails, just show regular success
        console.log('Status check error:', statusError);
        toast.success('Goal marked as completed for today! 🎉');
      }
      
      // Force immediate refetch and update
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todayProgress'] }),
        queryClient.invalidateQueries({ queryKey: ['myGoals'] }),
      ]);
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['todayProgress'] }),
        queryClient.refetchQueries({ queryKey: ['myGoals'] }),
      ]);
    } catch (error) {
      // Revert local state on error
      setCompletedGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
      console.error('Failed to mark goal as completed:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to mark goal as completed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const renderGoalCard = (goal: Goal, isJoined: boolean) => {
    const todayCompleted = isJoined ? getTodayProgress(goal._id) : false;
    const dynamicStyles = getStyles({ colors, isDark, mode, setMode });

    return (
      <Card key={goal._id} style={dynamicStyles.goalCard}>
        <View style={dynamicStyles.goalHeader}>
          <View style={dynamicStyles.goalTitleRow}>
            {goal.icon && <Text style={dynamicStyles.goalIcon}>{goal.icon}</Text>}
            <Text style={dynamicStyles.goalTitle}>{goal.title}</Text>
          </View>
          {isJoined && (
            <View style={[dynamicStyles.badge, dynamicStyles.joinedBadge]}>
              <Text style={dynamicStyles.badgeText}>Joined</Text>
            </View>
          )}
        </View>
        <Text style={dynamicStyles.goalDescription}>{goal.description}</Text>

        <View style={dynamicStyles.goalMeta}>
          {goal.timing && (
            <View style={dynamicStyles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={dynamicStyles.metaText}>{goal.timing}</Text>
            </View>
          )}
          {goal.points !== undefined && goal.points > 0 && (
            <View style={dynamicStyles.metaItem}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={[dynamicStyles.metaText, dynamicStyles.pointsText]}>
                {goal.points} points
              </Text>
            </View>
          )}
        </View>

        {isJoined ? (
          <View style={dynamicStyles.progressSection}>
            <View style={dynamicStyles.completeButton}>
              <Button
                title={todayCompleted ? "Completed for today" : "Mark as Completed Today"}
                onPress={() => handleMarkCompleted(goal._id)}
                loading={isUpdatingProgress}
                disabled={todayCompleted}
                variant={todayCompleted ? "outline" : "primary"}
              />
            </View>
          </View>
        ) : (
          <View style={dynamicStyles.joinButton}>
            <Button
              title="Join Goal"
              onPress={() => handleJoinGoal(goal._id)}
              loading={isJoining}
            />
          </View>
        )}
      </Card>
    );
  };

  const dynamicStyles = getStyles({ colors, isDark, mode, setMode });

  const renderListHeader = () => (
    <>
      <Text style={dynamicStyles.title}>Goals</Text>
      <Text style={dynamicStyles.subtitle}>Track your daily progress and achieve your wellness goals</Text>

      <View style={dynamicStyles.tabContainer}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'myGoals' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('myGoals')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'myGoals' && dynamicStyles.activeTabText]}>
            My Goals ({Array.isArray(myGoals) ? myGoals.length : 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'available' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'available' && dynamicStyles.activeTabText]}>
            Available ({goalsTotal})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'myGoals' && Array.isArray(myGoals) && myGoals.length > 0 && (
        <Card style={dynamicStyles.chartCard}>
          <View style={dynamicStyles.chartHeader}>
            <View>
              <Text style={dynamicStyles.chartTitle}>Weekly Completion Rate</Text>
              <Text style={dynamicStyles.chartSubtitle}>Your goal completion over the last 7 days</Text>
            </View>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
          </View>
          {isLoadingStats ? (
            <View style={dynamicStyles.chartLoading}>
              <Text style={dynamicStyles.chartLoadingText}>Loading chart data...</Text>
            </View>
          ) : Array.isArray(dailyStats) && dailyStats.length > 0 ? (
            <>
              <LineChart
                data={dailyStats.map(stat => ({
                  ...stat,
                  text: stat.label,
                  textColor: isDark ? colors.white : colors.text.primary,
                  textFontSize: 12,
                  textBackgroundColor: 'transparent',
                }))}
                width={width - 80}
                height={180}
                spacing={40}
                thickness={3}
                color={colors.primary}
                hideRules
                hideYAxisText
                yAxisColor={colors.gray[300]}
                xAxisColor={colors.gray[300]}
                curved
                areaChart
                startFillColor={colors.primary}
                endFillColor={colors.primaryLight}
                startOpacity={0.4}
                endOpacity={0.1}
                yAxisLabelWidth={0}
                yAxisTextStyle={{ color: colors.text.secondary, fontSize: 12 }}
                textColor={isDark ? colors.white : colors.text.primary}
                textFontSize={12}
                rulesType="solid"
                rulesColor={colors.gray[200]}
                maxValue={100}
                yAxisLabelSuffix="%"
                noOfSections={4}
                yAxisLabelPrefix=""
              />
              <View style={dynamicStyles.chartStats}>
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statValue}>
                    {Array.isArray(dailyStats) ? dailyStats.reduce((sum, day) => sum + (day.completedCount || 0), 0) : 0}
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Completed</Text>
                </View>
                <View style={dynamicStyles.statDivider} />
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statValue}>
                    {Array.isArray(dailyStats) && dailyStats.length > 0 
                      ? Math.round(dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / dailyStats.length)
                      : 0}%
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Avg. Rate</Text>
                </View>
                <View style={dynamicStyles.statDivider} />
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statValue}>{totalGoals}</Text>
                  <Text style={dynamicStyles.statLabel}>Total Goals</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={dynamicStyles.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.text.secondary} />
              <Text style={dynamicStyles.chartEmptyText}>No completion data yet</Text>
              <Text style={dynamicStyles.chartEmptySubtext}>Complete your goals to see your progress!</Text>
            </View>
          )}
        </Card>
      )}
    </>
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {activeTab === 'myGoals' ? (
        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderListHeader()}
          <View style={dynamicStyles.goalsList}>
            {isLoadingMyGoals ? (
              <Card style={dynamicStyles.emptyCard}>
                <Text style={dynamicStyles.emptyText}>Loading your goals...</Text>
              </Card>
            ) : !Array.isArray(myGoals) || myGoals.length === 0 ? (
              <Card style={dynamicStyles.emptyCard}>
                <Ionicons name="flag-outline" size={48} color={colors.text.secondary} />
                <Text style={dynamicStyles.emptyText}>You haven't joined any goals yet</Text>
                <Text style={dynamicStyles.emptySubtext}>Browse available goals to get started!</Text>
                <View style={dynamicStyles.browseButton}>
                  <Button
                    title="Browse Goals"
                    onPress={() => setActiveTab('available')}
                  />
                </View>
              </Card>
            ) : (
              myGoals.map((userGoal) => {
                const goal = typeof userGoal.goalId === 'object' ? userGoal.goalId : goals.find((g) => g._id === userGoal.goalId);
                if (!goal) return null;
                return renderGoalCard(goal, true);
              })
            )}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => renderGoalCard(item, isGoalJoined(item._id))}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={dynamicStyles.content}
          ListEmptyComponent={
            isLoading ? (
              <Card style={dynamicStyles.emptyCard}>
                <Text style={dynamicStyles.emptyText}>Loading goals...</Text>
              </Card>
            ) : (
              <Card style={dynamicStyles.emptyCard}>
                <Text style={dynamicStyles.emptyText}>No goals available at the moment</Text>
              </Card>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={dynamicStyles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={dynamicStyles.loadingFooterText}>Loading more goals...</Text>
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: ReturnType<typeof useTheme>) => {
  const { colors, isDark } = theme;
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.white,
  },
  goalsList: {
    gap: spacing.md,
  },
  goalCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  goalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  joinedBadge: {
    backgroundColor: isDark ? colors.primary : colors.primaryLight,
  },
  badgeText: {
    ...typography.bodySmall,
    color: isDark ? colors.white : colors.primary,
    fontWeight: '600',
  },
  goalDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  pointsText: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: spacing.md,
  },
  completedSection: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? colors.primary : colors.primaryLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  completedText: {
    ...typography.body,
    color: isDark ? colors.white : colors.primary,
    fontWeight: '600',
  },
  completeButton: {
    marginTop: spacing.xs,
  },
  joinButton: {
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  browseButton: {
    marginTop: spacing.md,
  },
  chartCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  chartLoading: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLoadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  chartEmpty: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  chartEmptyText: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  chartEmptySubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  loadingFooter: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingFooterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  });
};

