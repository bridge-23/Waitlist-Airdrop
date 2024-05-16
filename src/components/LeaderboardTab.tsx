"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type LeaderboardEntry = {
  id: string;
  user: string;
  invitedCount: number;
  points: number;
};

const ITEMS_PER_PAGE = 50;

export default function LeaderboardTab() {
  // setup pagination here
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  // setup supabase here
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const supabase = createClient();
  const [totalUsers, setTotalUsers] = useState(0);
  const [userPosition, setUserPosition] = useState(0);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      // Fetch the logged in user data
      const { data: userData, error: userFetchError } = await supabase.auth.getUser();

      if (userFetchError) {
        console.error('Error fetching user data:', userFetchError);
        return;
      }
      setLoggedInUser(userData.user);

      let { data, error, count } = await supabase
        .from('accounts')
        .select('id, twitter_handle, total_points, invited_accounts_count', { count: 'exact' })
        .neq('twitter_handle', '@galaxy.do')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return;
      }
      // Update the total number of users
      setTotalUsers(count || 0);

      // Fetch the user's position
      const { data: positionData, error: positionError } = await supabase
        .from('accounts')
        .select('total_points, id')
        .order('total_points', { ascending: false });

      if (positionError) {
        console.error('Error fetching user position:', positionError);
        return;
      }

      // Find the user's position
      const userPositionIndex = positionData.findIndex(entry => entry.id === userData.user?.id) + 1;
      setUserPosition(userPositionIndex);

      // Fetch top 50 accounts based on current page
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;
      const { data: pageData, error: pageError } = await supabase
        .from('accounts')
        .select('id, twitter_handle, total_points, invited_accounts_count')
        .neq('twitter_handle', '@galaxy.do')
        .order('total_points', { ascending: false })
        .range(startIndex, endIndex);

      if (pageError) {
        console.error('Error fetching leaderboard data:', pageError);
        return;
      }

      // Map the data to the leaderboard entries
      const leaderboardEntries = pageData.map((entry: any) => ({
        id: entry.id,
        user: entry.twitter_handle,
        invitedCount: entry.invited_accounts_count,
        points: entry.total_points,
      }));
      setLeaderboardData(leaderboardEntries);
    };

    fetchLeaderboardData();
  }, [supabase, currentPage]);

  const currentData = leaderboardData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle pagination change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card>
      <CardContent>
        <CardTitle className="px-4 text-center mt-6 font-semibold text-lg">
          Your Position : {userPosition}/{totalUsers}
        </CardTitle>
      </CardContent>
      <CardContent>
        <div className="bg-background p-2 w-full mx-auto rounded-lg shadow-none">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Invited Count</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((entry: LeaderboardEntry, index: number) => (
                <TableRow key={entry.id} className={entry.id === loggedInUser?.id ? "bg-[#7620a9]" : ""}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.invitedCount}</TableCell>
                  <TableCell>{entry.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Pagination component here */}
    </Card>
  );
}
