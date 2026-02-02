import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Gamepad2, Shield, Target } from 'lucide-react';
import { useTeamDetail } from '@/hooks/useTeamDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Tab components
import { TeamOverviewTab } from '@/components/team/TeamOverviewTab';
import { TeamDraftPatternsTab } from '@/components/team/TeamDraftPatternsTab';
import { TeamPlayerPoolsTab } from '@/components/team/TeamPlayerPoolsTab';
import { TeamMatchupToolTab } from '@/components/team/TeamMatchupToolTab';

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return 'text-green-400';
  if (winRate < 0.45) return 'text-red-400';
  return 'text-foreground';
}

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading, error } = useTeamDetail(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Team Not Found</h2>
          <p className="text-muted-foreground">Could not find team with ID: {id}</p>
          <Button onClick={() => navigate('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/teams')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Team Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-bold text-primary text-2xl">{team.acronym}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className={cn('font-mono font-semibold', getWinRateColor(team.win_rate))}>
                    {(team.win_rate * 100).toFixed(1)}%
                  </span>
                  Win Rate
                </span>
                <span className="flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  {team.series_played} series
                </span>
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap gap-4">
            {/* Record */}
            <div className="glass-card px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Record</p>
              <p className="font-mono font-semibold">
                <span className="text-green-400">{team.wins}W</span>
                <span className="text-muted-foreground"> - </span>
                <span className="text-red-400">{team.losses}L</span>
              </p>
            </div>

            {/* Side Stats */}
            <div className="glass-card px-4 py-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-blue-side flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Blue
                  </p>
                  <p className="font-mono">
                    <span className={getWinRateColor(team.blue_side_win_rate)}>
                      {(team.blue_side_win_rate * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">({team.blue_side_games}g)</span>
                  </p>
                </div>
                <div className="w-px h-8 bg-card-border" />
                <div className="text-center">
                  <p className="text-xs text-red-side flex items-center gap-1">
                    <Target className="w-3 h-3" /> Red
                  </p>
                  <p className="font-mono">
                    <span className={getWinRateColor(team.red_side_win_rate)}>
                      {(team.red_side_win_rate * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">({team.red_side_games}g)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Form */}
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-muted-foreground mb-1">Recent Form</p>
              <div className="flex gap-1">
                {team.recent_form.map((result, i) => (
                  <Badge
                    key={i}
                    variant={result === 'W' ? 'default' : 'destructive'}
                    className={cn(
                      'w-6 h-6 p-0 flex items-center justify-center text-xs font-bold',
                      result === 'W' ? 'bg-green-600 hover:bg-green-600' : 'bg-red-600 hover:bg-red-600'
                    )}
                  >
                    {result}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-card-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Draft Patterns</TabsTrigger>
          <TabsTrigger value="players">Player Pools</TabsTrigger>
          <TabsTrigger value="matchup">Matchup Tool</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeamOverviewTab team={team} />
        </TabsContent>

        <TabsContent value="patterns">
          <TeamDraftPatternsTab teamId={team.id} />
        </TabsContent>

        <TabsContent value="players">
          <TeamPlayerPoolsTab team={team} />
        </TabsContent>

        <TabsContent value="matchup">
          <TeamMatchupToolTab team={team} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
