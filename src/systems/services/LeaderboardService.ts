export interface LeaderboardEntry {
  playerName: string;
  bestWave: number;
}

export interface LeaderboardService {
  submitBestWave(bestWave: number): Promise<void>;
  getTopRuns(): Promise<LeaderboardEntry[]>;
}

export class LocalLeaderboardService implements LeaderboardService {
  async submitBestWave(): Promise<void> {
    // TODO: Wire this to Supabase/Firebase leaderboard storage.
    return;
  }

  async getTopRuns(): Promise<LeaderboardEntry[]> {
    return [];
  }
}
